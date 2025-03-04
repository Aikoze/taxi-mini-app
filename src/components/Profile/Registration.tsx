// src/components/Profile/Registration.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import { useTelegram } from '../../hooks/useTelegram';
import WebApp from '@twa-dev/sdk';

interface RegistrationProps {
  onSuccess: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('0661629260');
  const [email, setEmail] = useState<string>('youenn@gmail.com');
  const [address, setAddress] = useState<string>('wqdqwdqwd qwdwq');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
    email?: string;
    address?: string;
  }>({});
  const [isCheckingUser, setIsCheckingUser] = useState<boolean>(false);

  const { registerUser, telegramUser, isRegistered, isLoading: authLoading } = useAuth();
  const telegram = useTelegram();
  const { MainButton } = telegram;

  console.log(registerUser)
  // Rediriger si l'utilisateur est déjà enregistré
  useEffect(() => {
    if (isRegistered) {
      console.log('Utilisateur déjà enregistré, redirection depuis Registration.tsx');
      onSuccess();
    }
  }, [isRegistered, onSuccess]);

  // Configurer le bouton principal de Telegram
  useEffect(() => {
    if (MainButton) {
      MainButton.setText('S\'INSCRIRE');
      MainButton.show();

      const handleMainButtonClick = () => {
        // Simuler un clic sur le bouton de soumission
        document.getElementById('registration-submit')?.click();
      };

      MainButton.onClick(handleMainButtonClick);

      return () => {
        MainButton.offClick(handleMainButtonClick);
        MainButton.hide();
      };
    } else {
      console.warn('MainButton is not available');
    }
  }, [MainButton]);

  // Mettre à jour l'état du bouton principal en fonction de la validité du formulaire
  useEffect(() => {
    const formValid = isFormValid();

    if (MainButton) {
      if (formValid && !isLoading) {
        MainButton.enable();
      } else {
        MainButton.disable();
      }
    } else {
      console.warn('Cannot update MainButton state - button not available');
    }
  }, [phoneNumber, email, address, isLoading, validationErrors]);

  // Valider le formulaire
  const isFormValid = () => {
    const phoneValid = phoneNumber.trim() !== '';
    const emailValid = email.trim() !== '';
    const addressValid = address.trim() !== '';
    const noErrors = Object.keys(validationErrors).length === 0;

    return phoneValid && emailValid && addressValid;
  };

  // Valider le numéro de téléphone
  const validatePhoneNumber = (value: string) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!value.trim()) {
      return 'Le numéro de téléphone est requis';
    } else if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Format de téléphone invalide';
    }
    return undefined;
  };

  // Valider l'email
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      return 'L\'email est requis';
    } else if (!emailRegex.test(value)) {
      return 'Format d\'email invalide';
    }
    return undefined;
  };

  // Valider l'adresse
  const validateAddress = (value: string) => {
    if (!value.trim()) {
      return 'L\'adresse est requise';
    }
    return undefined;
  };

  // Gérer les changements de numéro de téléphone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);

    const error = validatePhoneNumber(value);
    setValidationErrors(prev => ({
      ...prev,
      phone: error
    }));
  };

  // Gérer les changements d'email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    const error = validateEmail(value);
    setValidationErrors(prev => ({
      ...prev,
      email: error
    }));
  };

  // Gérer les changements d'adresse
  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAddress(value);

    const error = validateAddress(value);
    setValidationErrors(prev => ({
      ...prev,
      address: error
    }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valider tous les champs
    const phoneError = validatePhoneNumber(phoneNumber);
    const emailError = validateEmail(email);
    const addressError = validateAddress(address);

    const newValidationErrors = {
      phone: phoneError,
      email: emailError,
      address: addressError
    };

    setValidationErrors(newValidationErrors);

    // Vérifier s'il y a des erreurs
    if (phoneError || emailError || addressError) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (MainButton) {
        MainButton.showProgress();
      }

      await registerUser(phoneNumber, email, address);

      setSuccessMessage('Inscription réussie !');

      // Notifier Telegram que l'opération est terminée
      if (WebApp && WebApp.close) {
        WebApp.close();
      }

      // Ne pas rediriger automatiquement
      // La redirection se fera uniquement lorsque l'utilisateur clique sur un bouton
      if (MainButton) {
        MainButton.hideProgress();
        MainButton.setText('CONTINUER');
        MainButton.onClick(() => {
          onSuccess();
        });
      }

    } catch (error) {
      setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      console.error('Error during registration:', error);

      if (MainButton) {
        MainButton.hideProgress();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {(isCheckingUser) ? (
        <div className="text-center p-6">
          <p className="text-gray-600">Vérification de votre compte...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Numéro de téléphone
            </label>
            <input
              id="phone"
              type="tel"
              className={`input ${validationErrors.phone ? 'border-red-500' : ''}`}
              placeholder="+33 6 12 34 56 78"
              value={phoneNumber}
              onChange={handlePhoneChange}
              disabled={isLoading}
              required
            />
            {validationErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`input ${validationErrors.email ? 'border-red-500' : ''}`}
              placeholder="exemple@domain.com"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              required
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
              Adresse
            </label>
            <textarea
              id="address"
              className={`input ${validationErrors.address ? 'border-red-500' : ''}`}
              placeholder="Votre adresse complète"
              value={address}
              onChange={handleAddressChange}
              rows={3}
              disabled={isLoading}
              required
            />
            {validationErrors.address && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
            )}
          </div>

          <Button
            id="registration-submit"
            type="submit"
            variant="primary"
            isLoading={isLoading}
            fullWidth
            disabled={!isFormValid() || isLoading}
          >
            S'inscrire
          </Button>
        </form>
      )}
    </div>
  );
};

export default Registration;