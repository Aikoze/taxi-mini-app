// Script pour démarrer localtunnel avec des options personnalisées
import localtunnel from 'localtunnel';
import config from './lt-config.js';

async function startTunnel() {
  try {
    console.log('Démarrage du tunnel localtunnel...');
    console.log(`Configuration: port=${config.port}, subdomain=${config.subdomain || 'aléatoire'}`);
    
    const tunnel = await localtunnel({
      port: config.port,
      subdomain: config.subdomain,
      host: config.host,
      local_host: config.local_host,
      allow_invalid_cert: config.allow_invalid_cert
    });
    
    console.log(`✅ Tunnel ouvert! URL: ${tunnel.url}`);
    console.log('Utilisez cette URL dans votre configuration de bot Telegram');
    console.log('Appuyez sur Ctrl+C pour arrêter le tunnel');
    
    tunnel.on('close', () => {
      console.log('Tunnel fermé');
      process.exit(0);
    });
    
    // Gérer la fermeture propre
    process.on('SIGINT', () => {
      console.log('Fermeture du tunnel...');
      tunnel.close();
    });
    
  } catch (error) {
    console.error('Erreur lors du démarrage du tunnel:', error);
    process.exit(1);
  }
}

startTunnel();
