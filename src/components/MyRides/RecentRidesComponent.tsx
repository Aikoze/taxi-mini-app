import React from 'react';
import { motion } from 'framer-motion';
import {
    IoCarOutline,
    IoCalendar,
    IoTime,
    IoPencil,
    IoLocationOutline,
    IoWalletOutline,
    IoChevronForward
} from 'react-icons/io5';
import dayjs from 'dayjs';

const RecentRidesComponent = ({ recentRides = [], handleEditRide }) => {
    // Animation variants pour listes
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    // Composant pour le statut
    const RideStatus = ({ status }) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
            assigned: { bg: 'bg-green-100', text: 'text-green-800', label: 'Assignée' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terminée' },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Annulée' }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    // Déterminer la couleur en fonction du type de course
    const getTypeColor = (isImmediate) => {
        if (isImmediate) {
            return {
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-200',
                icon: 'text-blue-500'
            };
        } else {
            return {
                bg: 'bg-purple-50',
                text: 'text-purple-700',
                border: 'border-purple-200',
                icon: 'text-purple-500'
            };
        }
    };

    // Déterminer la couleur en fonction du mode de paiement
    const getPaymentColor = (method) => {
        if (method === '100%') {
            return {
                bg: 'bg-green-50',
                text: 'text-green-700',
                border: 'border-green-200',
                icon: 'text-green-500'
            };
        } else if (method === '55%') {
            return {
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-200',
                icon: 'text-blue-500'
            };
        } else {
            return {
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                border: 'border-amber-200',
                icon: 'text-amber-500'
            };
        }
    };

    // Composant pour un badge
    const Badge = ({ children, colors }) => (
        <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}>
            {children}
        </div>
    );

    // Rendu des courses récentes (état vide)
    if (recentRides.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100"
            >
                <div className="text-gray-400 mb-3">
                    <IoCarOutline size={56} className="mx-auto" />
                </div>
                <p className="text-gray-600 font-medium">Aucune course récente</p>
                <p className="text-gray-400 text-sm mt-1">Vos dernières courses apparaîtront ici</p>
            </motion.div>
        );
    }

    // Rendu des courses
    return (
        <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {recentRides.map(ride => {
                const typeColor = getTypeColor(ride.is_immediate);
                const paymentColor = getPaymentColor(ride.payment_method);

                return (
                    <motion.div
                        key={ride.id}
                        variants={itemVariants}
                        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200"
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    >
                        <div className="p-5">
                            {/* En-tête avec adresse et statut */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-1.5 line-clamp-1">
                                        {ride.dropoff_address}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <IoLocationOutline className="mr-1.5 text-gray-400" />
                                        <span className="line-clamp-1">{ride.pickup_address}</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <RideStatus status={ride.status} />
                                </div>
                            </div>

                            {/* Informations secondaires */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {/* Type de course */}
                                <Badge colors={typeColor}>
                                    {ride.is_immediate ? (
                                        <>
                                            <IoTime className={`mr-1 ${typeColor.icon}`} />
                                            <span>Immédiate</span>
                                        </>
                                    ) : (
                                        <>
                                            <IoCalendar className={`mr-1 ${typeColor.icon}`} />
                                            <span>{dayjs(ride.pickup_datetime).format('DD/MM/YYYY HH:mm')}</span>
                                        </>
                                    )}
                                </Badge>

                                {/* Méthode de paiement */}
                                <Badge colors={paymentColor}>
                                    <IoWalletOutline className={`mr-1 ${paymentColor.icon}`} />
                                    <span>{ride.payment_method}</span>
                                </Badge>
                            </div>

                            {/* Pied avec date et bouton */}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-400">
                                    Créée le {dayjs(ride.created_at).format('DD/MM/YYYY')}
                                </span>

                                {ride.status === 'pending' ? (
                                    <button
                                        onClick={() => handleEditRide(ride)}
                                        className="flex items-center text-sm font-medium text-telegram-primary hover:text-telegram-light transition-colors"
                                    >
                                        <span>Modifier</span>
                                        <IoChevronForward className="ml-1" size={16} />
                                    </button>
                                ) : (
                                    <button
                                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <span>Détails</span>
                                        <IoChevronForward className="ml-1" size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export default RecentRidesComponent;