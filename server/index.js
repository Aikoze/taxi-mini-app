// server/index.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import telegramService from './telegramService.js';
import rideAssignmentService from './rideAssignmentService.js';
import autoAssignmentService from './autoAssignmentService.js';
import statsServiceFactory from './statsService.js';

// Configuration
dotenv.config({ path: './server/.env' });
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Initialisation de Supabase (seulement si les variables d'environnement sont définies)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialisation des services
const statsService = statsServiceFactory(supabase);

// Initialisation d'Express
const app = express();

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  // console.log('Headers:', req.headers);
  next();
});

// Middleware
// Configuration CORS plus permissive pour le développement
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://taxi-mini-app.loca.lt'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware pour les requêtes OPTIONS préliminaires CORS
app.options('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://taxi-mini-app.loca.lt'],
  credentials: true
}));

app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
  res.send('API du Taxi Mini App est en ligne!');
});

// Route pour valider l'authentification Telegram
app.post('/api/auth/validate', async (req, res) => {
  try {
    const { id } = req.body;
    console.log('Validation de l\'authentification Telegram:', id);
    let isRegistered = false;
    let user = null;

    if (supabase) {
      try {
        console.log('Vérification de l\'utilisateur dans Supabase avec ID:', id);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = Not found
          console.error('Erreur Supabase lors de la recherche utilisateur:', error);
        }

        if (data) {
          isRegistered = true;
          user = data;
          console.log('Utilisateur trouvé dans Supabase:', data);
        } else {
          console.log('Aucun utilisateur trouvé avec l\'ID Telegram:', id);
        }
      } catch (supabaseError) {
        console.error('Erreur lors de la requête Supabase:', supabaseError);
      }
    } else {
      console.warn('Supabase non initialisé, impossible de vérifier l\'utilisateur');
    }

    return res.json({
      isRegistered,
      user
    });
  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    res.status(500).json({ error: 'Erreur lors de la validation des données Telegram' });
  }
});

// Route pour enregistrer un nouvel utilisateur
app.post('/api/users', async (req, res) => {
  try {
    const { telegramUser, phone, email, address } = req.body;

    // Créer l'utilisateur dans la base de données
    const user = {
      telegram_id: telegramUser.id.toString(),
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name || null,
      username: telegramUser.username || null,
      phone_number: phone,
      email: email,
      address: address,
      created_at: new Date().toISOString()
    };

    // Enregistrer l'utilisateur dans Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([user])
          .select()
          .single();

        if (error) {
          console.error('Erreur Supabase lors de l\'insertion utilisateur:', error);
          return res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'enregistrement dans la base de données',
            message: error.message
          });
        }

        return res.json({
          success: true,
          data: data,
          message: 'Utilisateur enregistré avec succès'
        });
      } catch (supabaseError) {
        console.error('Erreur lors de la requête Supabase:', supabaseError);
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la requête à la base de données',
          message: supabaseError.message
        });
      }
    } else {
      // Mode sans Supabase (développement)
      console.warn('Supabase non initialisé, simulation d\'enregistrement utilisateur');

      // Ajouter un ID simulé
      user.id = Date.now();

      return res.json({
        success: true,
        data: user,
        message: 'Utilisateur enregistré avec succès (mode simulation)'
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de l\'utilisateur',
      message: error.message
    });
  }
});

// Route pour récupérer les courses d'un utilisateur
app.get('/api/users/:userId/rides', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.query;

  console.log(`Récupération des courses pour l'utilisateur ${userId}${status ? ` avec statut ${status}` : ''}`);

  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Service de base de données non disponible'
      });
    }

    // Préparer la requête pour récupérer les courses de l'utilisateur
    let query = supabase
      .from('rides')
      .select(`
        *,
        pickup_location:saved_locations!pickup_location_id(*),
        dropoff_location:saved_locations!dropoff_location_id(*),
        assigned_driver:users!rides_assigned_to_fkey(*)
      `)
      .order('pickup_datetime', { ascending: false })
      .eq('created_by', userId);

    // Filtrer par statut si spécifié
    if (status) {
      query = query.eq('status', status);
    }

    // Exécuter la requête
    const { data: rides, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des courses:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des courses',
        message: error.message
      });
    }

    // Transformer les données pour correspondre au format attendu par le client
    const formattedRides = rides.map(ride => ({
      id: ride.id,
      created_by: ride.created_by,
      is_immediate: ride.is_immediate,
      pickup_datetime: ride.pickup_datetime,
      pickup_address: ride.pickup_address,
      pickup_lat: ride.pickup_lat,
      pickup_lng: ride.pickup_lng,
      dropoff_address: ride.dropoff_address,
      client_phone: ride.client_phone,
      payment_method: ride.payment_method,
      status: ride.status,
      assigned_to: ride.assigned_to,
      current_group_id: ride.current_group_id,
      created_at: ride.created_at,
      completed_at: ride.completed_at,
      pickup_location_id: ride.pickup_location_id,
      dropoff_location_id: ride.dropoff_location_id,
      pickup_location: ride.pickup_location,
      dropoff_location: ride.dropoff_location,
      assigned_driver: ride.assigned_driver
    }));

    res.json(formattedRides);
  } catch (err) {
    console.error('Erreur serveur:', err);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des courses'
    });
  }
});

// Route pour récupérer les courses disponibles
app.get('/api/rides/available', async (req, res) => {
  console.log('Récupération des courses disponibles');

  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Service de base de données non disponible'
      });
    }

    // Récupérer les courses disponibles (status = 'pending' et pas encore assignées)
    const { data: rides, error } = await supabase
      .from('rides')
      .select(`
        *,
        pickup_location:saved_locations!pickup_location_id(*),
        dropoff_location:saved_locations!dropoff_location_id(*)
      `)
      .eq('status', 'pending')
      .order('pickup_datetime', { ascending: false })
      .is('assigned_to', null);

    if (error) {
      console.error('Erreur lors de la récupération des courses disponibles:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des courses disponibles',
        message: error.message
      });
    }

    // Transformer les données pour correspondre au format attendu par le client
    const formattedRides = rides.map(ride => ({
      id: ride.id,
      created_by: ride.created_by,
      is_immediate: ride.is_immediate,
      pickup_datetime: ride.pickup_datetime,
      pickup_address: ride.pickup_address,
      pickup_lat: ride.pickup_lat,
      pickup_lng: ride.pickup_lng,
      dropoff_address: ride.dropoff_address,
      client_phone: ride.client_phone,
      payment_method: ride.payment_method,
      status: ride.status,
      assigned_to: ride.assigned_to,
      current_group_id: ride.current_group_id,
      created_at: ride.created_at,
      completed_at: ride.completed_at,
      pickup_location_id: ride.pickup_location_id,
      dropoff_location_id: ride.dropoff_location_id,
      pickup_location: ride.pickup_location,
      dropoff_location: ride.dropoff_location
    }));

    res.json(formattedRides);
  } catch (err) {
    console.error('Erreur serveur:', err);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des courses disponibles'
    });
  }
});

// Route pour créer une nouvelle course
app.post('/api/rides', async (req, res) => {
  console.log('Création d\'une nouvelle course:', req.body);

  try {
    const {
      userId,
      isImmediate,
      pickupDate,
      pickupTime,
      pickupLocation,
      dropoffLocation,
      clientPhone,
      paymentMethod
    } = req.body;

    if (!userId || !pickupLocation || !dropoffLocation || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes pour la création de la course'
      });
    }

    // Construire la date et heure de prise en charge
    let pickupDateTime;
    if (isImmediate) {
      // Si c'est immédiat, utiliser la date et l'heure actuelles
      pickupDateTime = new Date().toISOString();
    } else {
      // Sinon, combiner la date et l'heure fournies
      if (!pickupDate || !pickupTime) {
        return res.status(400).json({
          success: false,
          error: 'Date ou heure de prise en charge manquante'
        });
      }
      pickupDateTime = `${pickupDate}T${pickupTime}:00`;
    }

    // Préparer les données pour l'insertion dans Supabase
    const rideData = {
      created_by: userId,
      is_immediate: isImmediate,
      pickup_datetime: pickupDateTime,
      pickup_address: pickupLocation.address,
      pickup_lat: pickupLocation.latitude || null,
      pickup_lng: pickupLocation.longitude || null,
      pickup_location_id: pickupLocation.id || null,
      dropoff_address: dropoffLocation.address,
      dropoff_location_id: dropoffLocation.id || null,
      client_phone: clientPhone || null,
      payment_method: paymentMethod,
      status: 'pending',
      created_at: new Date().toISOString(),
      current_group_id: '@TaxiDispatchMarseille'
    };

    // Insérer la course dans Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('rides')
        .insert([rideData])
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la création de la course:', error);
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de l\'enregistrement de la course',
          message: error.message
        });
      }
      console.log(data);
      // Envoyer une notification Telegram si un groupe est spécifié
      if (data.current_group_id) {
        try {
          const result = await telegramService.sendNewRideNotification(data, data.current_group_id);
          if (result) {
            console.log('Notification Telegram envoyée avec succès au groupe', data.current_group_id);
          } else {
            console.warn('La notification Telegram n\'a pas pu être envoyée au groupe', data.current_group_id);
          }
        } catch (notifError) {
          console.error('Erreur lors de l\'envoi de la notification Telegram:', notifError);
          // Ne pas bloquer la réponse en cas d'erreur de notification
        }
      }

      return res.status(201).json({
        success: true,
        data: data
      });
    } else {
      console.warn('Supabase non initialisé, impossible de créer la course');
      return res.status(503).json({
        success: false,
        error: 'Service de base de données non disponible'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de la course:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la création de la course'
    });
  }
});

// Route pour qu'un chauffeur manifeste son intérêt pour une course
app.post('/api/rides/:rideId/interest', async (req, res) => {
  const { rideId } = req.params;
  const { driverId, latitude, longitude } = req.body;

  console.log(`Chauffeur ${driverId} manifeste son intérêt pour la course ${rideId}`, { latitude, longitude });

  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Service de base de données non disponible'
      });
    }

    if (!driverId || !rideId) {
      return res.status(400).json({
        success: false,
        error: 'ID du chauffeur et ID de la course sont requis'
      });
    }

    // Vérifier si la course existe et est toujours en attente
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .eq('status', 'pending')
      .single();

    if (rideError || !ride) {
      console.error('Erreur lors de la vérification de la course:', rideError);
      return res.status(404).json({
        success: false,
        error: 'Course non trouvée ou non disponible',
        message: rideError?.message
      });
    }

    // Vérifier si le chauffeur a déjà manifesté son intérêt
    const { data: existingInterest, error: interestError } = await supabase
      .from('ride_interests')
      .select('*')
      .eq('ride_id', rideId)
      .eq('driver_id', driverId)
      .single();

    if (existingInterest) {
      // Mettre à jour l'intérêt existant avec les nouvelles coordonnées
      const { data: updatedInterest, error: updateError } = await supabase
        .from('ride_interests')
        .update({
          latitude: latitude || existingInterest.latitude,
          longitude: longitude || existingInterest.longitude,
          created_at: new Date().toISOString()
        })
        .eq('id', existingInterest.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'intérêt:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de la mise à jour de l\'intérêt',
          message: updateError.message
        });
      }

      return res.json({
        success: true,
        data: updatedInterest,
        message: 'Intérêt mis à jour avec succès'
      });
    } else {
      // Créer un nouvel intérêt
      const interestData = {
        driver_id: driverId,
        ride_id: parseInt(rideId),
        latitude: latitude || 0,
        longitude: longitude || 0,
        created_at: new Date().toISOString()
      };

      const { data: newInterest, error: createError } = await supabase
        .from('ride_interests')
        .insert([interestData])
        .select()
        .single();

      if (createError) {
        console.error('Erreur lors de la création de l\'intérêt:', createError);
        return res.status(500).json({
          success: false,
          error: 'Erreur lors de l\'enregistrement de l\'intérêt',
          message: createError.message
        });
      }

      return res.status(201).json({
        success: true,
        data: newInterest,
        message: 'Intérêt enregistré avec succès'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la manifestation d\'intérêt:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la manifestation d\'intérêt'
    });
  }
});

// Route pour récupérer une course par son ID
app.get('/api/rides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Récupération de la course avec ID ${id}`);

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Service Supabase non disponible'
      });
    }

    const { data, error } = await supabase
      .from('rides')
      .select(`
        *
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.log(error);
      console.error(`Erreur lors de la récupération de la course ${id}:`, error);
      return res.status(404).json({
        success: false,
        error: 'Course non trouvée'
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la course:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération de la course'
    });
  }
});

// Route pour récupérer les emplacements enregistrés
app.get('/api/locations', async (req, res) => {
  console.log('Récupération des emplacements enregistrés');
  const { category } = req.query;

  try {
    // Préparer la requête Supabase
    let query = supabase
      .from('saved_locations')
      .select('*')
      .eq('is_active', true);

    // Filtrer par catégorie si spécifiée
    if (category) {
      query = query.eq('category', category);
    }

    // Exécuter la requête
    const { data: locations, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des emplacements:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération des emplacements' });
    }

    // Transformer les données pour correspondre au format attendu par le client
    const formattedLocations = locations.map(location => ({
      id: location.id,
      name: location.name,
      short_name: location.short_name,
      address: location.address,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      category: location.category,
      is_active: location.is_active,
      created_at: location.created_at
    }));

    res.json(formattedLocations);
  } catch (err) {
    console.error('Erreur serveur:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des emplacements' });
  }
});

// PATCH /api/rides/:id - Mettre à jour une course
app.patch('/api/rides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Empêcher la mise à jour de certains champs
    delete updates.id;
    delete updates.created_by;

    // Récupérer les données actuelles de la course pour comparer les statuts
    const { data: currentRide, error: fetchError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Mettre à jour la course
    const { data, error } = await supabase
      .from('rides')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Si le statut a été modifié, envoyer une notification
    if (updates.status && currentRide.status !== updates.status) {
      try {
        await telegramService.sendRideStatusUpdateNotification(
          data,
          currentRide.status,
          updates.status
        );
        console.log(`Notification de mise à jour de statut envoyée: ${currentRide.status} -> ${updates.status}`);
      } catch (notifError) {
        console.error('Erreur lors de l\'envoi de la notification de mise à jour:', notifError);
        // Ne pas bloquer la réponse en cas d'erreur de notification
      }
    }

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Une erreur est survenue lors de la mise à jour de la course.'
    });
  }
});

// Route pour récupérer les détails d'attribution d'une course (pour le reporting)  
app.get('/api/rides/:rideId/assignment', async (req, res) => {
  try {
    const { rideId } = req.params;

    // Récupérer les détails d'attribution
    const assignmentDetails = await rideAssignmentService.getRideAssignmentDetails(rideId);

    if (!assignmentDetails) {
      return res.status(404).json({
        success: false,
        error: 'Aucun détail d\'attribution trouvé pour cette course'
      });
    }

    return res.json({
      success: true,
      data: assignmentDetails
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails d\'attribution:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des détails d\'attribution'
    });
  }
});

// Route pour forcer la vérification et l'attribution des courses expirées (pour les tests)
app.post('/api/rides/process-expired', async (req, res) => {
  try {
    console.log('Vérification et attribution des courses expirées...');
    const processedRides = await rideAssignmentService.assignExpiredRides();

    return res.json({
      success: true,
      data: {
        processed: processedRides.length,
        rides: processedRides
      }
    });
  } catch (error) {
    console.error('Erreur lors du traitement des courses expirées:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement des courses expirées'
    });
  }
});

// Route pour retirer l'interet d'une course
app.delete('/api/rides/:rideId/interest/:driverId', async (req, res) => {
  try {
    const { rideId, driverId } = req.params;

    // Retirer l'interet
    const removed = await rideAssignmentService.removeInterest(rideId, driverId);

    return res.json({
      success: true,
      data: removed
    });
  } catch (error) {
    console.error('Erreur lors du retrait de l\'intérêt:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du retrait de l\'intérêt'
    });
  }
});

// Route pour récupérer les détails d'attribution d'une course
app.get('/api/rides/:rideId/assignment', async (req, res) => {
  try {
    const { rideId } = req.params;

    // Récupérer les détails d'attribution
    const assignmentDetails = await rideAssignmentService.getRideAssignmentDetails(rideId);

    if (!assignmentDetails) {
      return res.status(404).json({
        success: false,
        error: 'Détails d\'attribution non trouvés'
      });
    }

    return res.json({
      success: true,
      data: assignmentDetails
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails d\'attribution:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des détails d\'attribution'
    });
  }
});

// Route pour simuler l'attribution d'une course (pour les tests)
app.post('/api/rides/simulate-assignment', async (req, res) => {
  try {
    const { rideId, driverId } = req.body;

    if (!rideId || !driverId) {
      return res.status(400).json({
        success: false,
        error: 'rideId et driverId sont requis'
      });
    }

    // Mettre à jour la course avec le statut 'assigned'
    const { error } = await supabase
      .from('rides')
      .update({
        status: 'assigned',
        assigned_to: driverId
      })
      .eq('id', rideId);

    if (error) {
      console.error('Erreur lors de la simulation d\'attribution:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la simulation d\'attribution'
      });
    }

    return res.json({
      success: true,
      message: 'Attribution simulée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la simulation d\'attribution:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la simulation d\'attribution'
    });
  }
});


// endpoint pour mettre à jour une course
app.put('/api/rides/:rideId', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status, driverId } = req.body;

    console.log('Mise à jour de la course:', { rideId, status, driverId });

    if (!rideId || !status) {
      return res.status(400).json({
        success: false,
        error: 'rideId et status sont requis'
      });
    }

    // Mettre à jour la course avec le statut 'assigned'
    const { data, error } = await supabase
      .from('rides')
      .update({
        status: status,
        assigned_to: driverId
      })
      .eq('id', rideId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la course:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour de la course'
      });
    }

    return res.json({
      success: true,
      message: 'Course mise à jour avec succès',
      data: data
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la course:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la mise à jour de la course'
    });
  }
});

// Endpoint pour l'assignation automatique d'une course lorsque son timer expire
app.post('/api/rides/:rideId/auto-assign', async (req, res) => {
  try {
    const { rideId } = req.params;

    console.log(`Déclenchement de l'assignation automatique pour la course ${rideId}`);

    // Appeler le service d'assignation automatique
    const result = await autoAssignmentService.autoAssignRide(parseInt(rideId));

    if (!result.success) {
      console.error(`Erreur lors de l'assignation automatique de la course ${rideId}:`, result.error);
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error(`Erreur serveur lors de l'assignation automatique de la course:`, error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'assignation automatique'
    });
  }
});

// Démarrage du serveur
// Routes pour les statistiques
app.get('/api/stats/group', async (req, res) => {
  console.log('Récupération des statistiques globales du groupe');

  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Service Supabase non disponible',
        data: null
      });
    }

    const stats = await statsService.getGroupStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du groupe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

app.get('/api/users/:userId/stats', async (req, res) => {
  const { userId } = req.params;
  console.log(`Récupération des statistiques pour l'utilisateur ${userId}`);

  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Service Supabase non disponible',
        data: null
      });
    }

    const stats = await statsService.getUserStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des statistiques de l'utilisateur ${userId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

app.get('/api/stats/daily', async (req, res) => {
  console.log('Récupération des statistiques quotidiennes');

  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Service Supabase non disponible',
        data: null
      });
    }

    const stats = await statsService.getDailyStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques quotidiennes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

// Démarrer le serveur seulement si ce n'est pas dans un environnement serverless (comme Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`API disponible à http://localhost:${PORT}`);
  });
}

export default app;
