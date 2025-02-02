import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isValid } from 'date-fns';
import { FiActivity, FiClock, FiGlobe, FiMonitor, FiCheck, FiX } from 'react-icons/fi';
import DOMPurify from 'dompurify';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/auth/activity-logs`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (Array.isArray(response.data)) {
                    setLogs(response.data);
                } else {
                    console.error('Invalid logs data:', response.data);
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('Error fetching activity logs:', err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch activity logs');
                setLogs([]); // Reset logs on error
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C4A484]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-800">{error}</p>
            </div>
        );
    }

    if (!Array.isArray(logs) || logs.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
                <FiActivity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No activity logs found.</p>
            </div>
        );
    }

    const getActionIcon = (action) => {
        switch (action) {
            case 'login':
                return 'Login🔑';
            case 'logout':
                return 'Logout👋';
            case 'register':
                return 'Register✨';
            case 'profile_update':
                return 'Profile Update👤';
            case 'password_change':
                return 'Password Change🔒';
            case 'address_add':
                return 'Address Add📍';
            case 'address_update':
                return 'Address Update📝';
            case 'address_delete':
                return 'Address Delete🗑️';
            case 'address_set_default':
                return 'Default Address Set📌';
            case 'checkout':
                return 'Checkout🛒';
            case 'order_status_update':
                return 'Order Status Update📦';
            default:
                return 'Activity Log📋';
        }
    };

    const getStatusColor = (status) => {
        return status === 'success' ? 'text-green-500' : 'text-red-500';
    };

    const getStatusIcon = (status) => {
        return status === 'success' ? <FiCheck className="w-5 h-5" /> : <FiX className="w-5 h-5" />;
    };

    const formatTimestamp = (timestamp) => {
        try {
            const date = new Date(timestamp);
            if (!isValid(date)) {
                return 'Invalid date';
            }
            return format(date, 'MMM d, yyyy h:mm a');
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    const sanitizeContent = (content) => {
        if (typeof content === 'string') {
            return DOMPurify.sanitize(content);
        }
        return content;
    };

    return (
        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
                {logs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="text-2xl">{getActionIcon(log.action)}</div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                    {log.action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </p>
                                <div className={`flex items-center ${getStatusColor(log.status)}`}>
                                    {getStatusIcon(log.status)}
                                </div>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                                <FiClock className="w-4 h-4 mr-1" />
                                {formatTimestamp(log.createdAt)}
                            </div>
                            {log.details && (
                                <div className="mt-2 text-sm text-gray-600">
                                    {typeof log.details === 'object' 
                                        ? Object.entries(log.details).map(([key, value]) => (
                                            <div key={key} className="text-xs">
                                                <span className="font-medium">{sanitizeContent(key)}:</span> {' '}
                                                {typeof value === 'object' 
                                                    ? sanitizeContent(JSON.stringify(value))
                                                    : sanitizeContent(value)
                                                }
                                            </div>
                                        ))
                                        : sanitizeContent(log.details)
                                    }
                                </div>
                            )}
                            {log.ip && (
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                    <FiGlobe className="w-4 h-4 mr-1" />
                                    IP: {log.ip}
                                    {log.userAgent && (
                                        <>
                                            <FiMonitor className="w-4 h-4 ml-2 mr-1" />
                                            {log.userAgent}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #C4A484;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #B39374;
                }
                `}
            </style>
        </div>
    );
};

export default ActivityLogs; 