// src/components/CreateRide/DateTimeStep.tsx
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import dayjs from 'dayjs';

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
                    <div className="grid grid-cols-1 gap-2">
                        {dateOptions.map((option) => (
                            <button
                                key={option.value}
                                className={`p-3 text-left rounded-lg border ${date === option.value
                                        ? 'border-telegram-primary bg-telegram-light'
                                        : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                onClick={() => onDateChange(option.value)}
                            >
                                <span className="font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {timeOptions.map((timeOption) => (
                        <button
                            key={timeOption}
                            className={`py-2 px-3 rounded-lg border ${time === timeOption
                                    ? 'border-telegram-primary bg-telegram-light'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            onClick={() => onTimeChange(timeOption)}
                        >
                            {timeOption}
                        </button>
                    ))}
                </div>
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
                    onClick={onNext}
                    disabled={!time || (!isImmediate && !date)}
                >
                    Continuer
                </Button>
            </div>
        </Card>
    );
};

export default DateTimeStep;