// src/components/CreateRide/DateTimeStep.tsx
import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import dayjs from 'dayjs';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface DateTimeStepProps {
    isImmediate: boolean;
    date: string;
    time: string;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    onNext: () => void;
    onBack: () => void;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({
    isImmediate,
    date,
    time,
    onDateChange,
    onTimeChange,
    onNext,
    onBack
}) => {
    const [customDate, setCustomDate] = useState<string>(date);
    const [customTime, setCustomTime] = useState<string>(time);
    const [dateError, setDateError] = useState<string>('');
    const [timeError, setTimeError] = useState<string>('');
    const [showSuggestions, setShowSuggestions] = useState<boolean>(true);

    // Validate date and time on component mount or when they change
    useEffect(() => {
        if (customDate) validateDate(customDate);
        if (customTime) validateTime(customTime);
    }, []);

    // Générer des heures suggérées (toutes les 15 minutes pour les 2 prochaines heures)
    const generateTimeOptions = () => {
        const options = [];
        const now = dayjs();

        // Arrondir à l'intervalle de 15 min supérieur
        const minutes = Math.ceil(now.minute() / 15) * 15;
        let startTime = now.minute(minutes).second(0);

        // Si on a dépassé l'heure, passer à l'heure suivante
        if (minutes >= 60) {
            startTime = startTime.add(1, 'hour').minute(0);
        }

        // Générer 8 créneaux (2 heures par tranches de 15 min)
        for (let i = 0; i < 8; i++) {
            const timeOption = startTime.add(i * 15, 'minute');
            options.push(timeOption.format('HH:mm'));
        }

        return options;
    };

    // Générer des dates suggérées pour les 7 prochains jours
    const generateDateOptions = () => {
        const options = [];
        const now = dayjs();

        for (let i = 0; i < 7; i++) {
            const dateOption = now.add(i, 'day');
            options.push({
                value: dateOption.format('YYYY-MM-DD'),
                label: i === 0
                    ? 'Aujourd\'hui'
                    : i === 1
                        ? 'Demain'
                        : dateOption.format('dddd DD/MM')
            });
        }

        return options;
    };

    // Validate date format and ensure it's not in the past
    const validateDate = (value: string): boolean => {
        // Clear previous error
        setDateError('');

        // Check if date is in valid format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
            setDateError('Format de date invalide. Utilisez le format AAAA-MM-JJ');
            return false;
        }

        // Check if date is valid
        const selectedDate = dayjs(value);
        if (!selectedDate.isValid()) {
            setDateError('Date invalide');
            return false;
        }

        // Check if date is not in the past
        const today = dayjs().startOf('day');
        if (selectedDate.isBefore(today)) {
            setDateError('La date ne peut pas être dans le passé');
            return false;
        }

        // Valid date, update parent component
        onDateChange(value);
        return true;
    };

    // Validate time format and ensure it's not in the past if date is today
    const validateTime = (value: string): boolean => {
        // Clear previous error
        setTimeError('');

        // Check if time is in valid format (HH:MM)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(value)) {
            setTimeError('Format d\'heure invalide. Utilisez le format HH:MM');
            return false;
        }

        // If date is today, check if time is not in the past
        if (date && dayjs(date).isSame(dayjs(), 'day')) {
            const now = dayjs();
            const [hours, minutes] = value.split(':').map(Number);
            const selectedTime = dayjs().hour(hours).minute(minutes);

            if (selectedTime.isBefore(now)) {
                setTimeError('L\'heure ne peut pas être dans le passé');
                return false;
            }
        }

        // Valid time, update parent component
        onTimeChange(value);
        return true;
    };

    // Handle custom date input
    const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomDate(value);
        if (value) validateDate(value);
    };

    // Handle custom time input
    const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomTime(value);
        if (value) validateTime(value);
    };

    const timeOptions = generateTimeOptions();
    const dateOptions = generateDateOptions();

    return (
        <Card>
            <h2 className="text-xl font-semibold mb-4">
                {isImmediate ? 'Heure de prise en charge' : 'Date et heure de prise en charge'}
            </h2>

            {!isImmediate && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="text-gray-400" />
                        </div>
                        <input
                            type="date"
                            className={`input pl-10 ${dateError ? 'border-red-500' : ''}`}
                            value={customDate}
                            onChange={handleDateInput}
                            placeholder="AAAA-MM-JJ"
                            min={dayjs().format('YYYY-MM-DD')}
                        />
                    </div>
                    {dateError && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                            <AlertTriangle className="mr-1" /> {dateError}
                        </p>
                    )}
                </div>
            )}

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="text-gray-400" />
                    </div>
                    <input
                        type="time"
                        className={`input pl-10 ${timeError ? 'border-red-500' : ''}`}
                        value={customTime}
                        onChange={handleTimeInput}
                        step="300" // 5 minutes steps
                    />
                </div>
                {timeError && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertTriangle className="mr-1" /> {timeError}
                    </p>
                )}
            </div>
            <div className="flex gap-3">
                <Button
                    variant="secondary"
                    onClick={onBack}
                >
                    Retour
                </Button>
                <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                        // Validate inputs before proceeding
                        let isValid = true;

                        if (!isImmediate && customDate) {
                            isValid = validateDate(customDate) && isValid;
                        }

                        if (customTime) {
                            isValid = validateTime(customTime) && isValid;
                        }

                        if (isValid) {
                            onNext();
                        }
                    }}
                    disabled={!time || (!isImmediate && !date) || !!timeError || !!dateError}
                >
                    Continuer
                </Button>
            </div>
        </Card>
    );
};

export default DateTimeStep;