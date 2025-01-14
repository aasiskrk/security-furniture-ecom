import { Link } from 'react-router-dom';
import {
    ClipboardDocumentListIcon,
    ShoppingBagIcon,
} from '@heroicons/react/24/outline';

const AdminCard = ({ title, description, icon: Icon, to }) => (
    <Link
        to={to}
        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
        <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
                <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    </Link>
);

const Admin = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdminCard
                    title="Products"
                    description="Manage your product inventory"
                    icon={ShoppingBagIcon}
                    to="/admin/products"
                />
                <AdminCard
                    title="Orders"
                    description="View and manage customer orders"
                    icon={ClipboardDocumentListIcon}
                    to="/admin/orders"
                />
            </div>
        </div>
    );
};

export default Admin; 