// src/components/TakeRide/utils/timeUtils.ts
import dayjs from 'dayjs';

/**
 * Calcule le temps restant avant l'expiration d'une course
 */
export const getRemainingTime = (createdAt: string, isImmediate: boolean) => {
  const created = dayjs(createdAt);
  const timeout = isImmediate ? 2 : 30; // minutes
  const expiresAt = created.add(timeout, 'minute');
  const now = dayjs();

  if (now.isAfter(expiresAt)) {
    return { 
      formatted: '0:00', 
      totalSeconds: 0, 
      isExpired: true 
    };
  }

  const diffMinutes = expiresAt.diff(now, 'minute');
  const diffSeconds = expiresAt.diff(now, 'second') % 60;
  const totalSeconds = expiresAt.diff(now, 'second');
  const isUrgent = totalSeconds <= 30 && isImmediate;

  return {
    formatted: `${diffMinutes}:${diffSeconds.toString().padStart(2, '0')}`,
    totalSeconds,
    isUrgent,
    isExpired: false
  };
};

/**
 * Calcule le pourcentage de temps écoulé pour la barre de progression
 */
export const getTimeProgressPercentage = (createdAt: string, isImmediate: boolean) => {
  const created = dayjs(createdAt);
  const timeout = isImmediate ? 2 : 30; // minutes
  const expiresAt = created.add(timeout, 'minute');
  const totalDuration = timeout * 60; // en secondes
  const now = dayjs();

  if (now.isAfter(expiresAt)) {
    return 100;
  }

  const elapsedSeconds = now.diff(created, 'second');
  const percentageElapsed = (elapsedSeconds / totalDuration) * 100;

  return Math.min(percentageElapsed, 100);
};

/**
 * Vérifie si le temps d'une course est expiré
 */
export const checkIfExpired = (createdAt: string, isImmediate: boolean) => {
  const created = dayjs(createdAt);
  const timeout = isImmediate ? 2 : 30; // minutes
  const expiresAt = created.add(timeout, 'minute');
  const now = dayjs();

  return now.isAfter(expiresAt);
};

/**
 * Formate la date et l'heure pour l'affichage
 */
export const formatDateTime = (dateString: string) => {
  const date = dayjs(dateString);
  const today = dayjs().startOf('day');
  const tomorrow = dayjs().add(1, 'day').startOf('day');

  if (date.isSame(today, 'day')) {
    return `Aujourd'hui à ${date.format('HH:mm')}`;
  } else if (date.isSame(tomorrow, 'day')) {
    return `Demain à ${date.format('HH:mm')}`;
  } else {
    return date.format('DD/MM/YYYY à HH:mm');
  }
};
