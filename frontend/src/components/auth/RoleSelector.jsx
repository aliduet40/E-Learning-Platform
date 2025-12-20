import React from 'react';
import { User, GraduationCap, Shield } from 'lucide-react';
import { ROLES } from '../../utils/constants';

const RoleSelector = ({ selectedRole, onSelect }) => {
    const roles = [
        { id: ROLES.STUDENT, title: 'Student', icon: GraduationCap, description: 'I want to learn' },
        { id: ROLES.INSTRUCTOR, title: 'Instructor', icon: User, description: 'I want to teach' },
        // Admin role might be hidden in production or restricted, but included per requirements
        { id: ROLES.ADMIN, title: 'Admin', icon: Shield, description: 'Platform manager' },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                    <div
                        key={role.id}
                        onClick={() => onSelect(role.id)}
                        className={`
              cursor-pointer rounded-lg border p-4 flex flex-col items-center justify-center text-center transition-all
              ${isSelected
                                ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500'
                                : 'border-gray-700 bg-surface hover:border-gray-600 hover:bg-gray-800'
                            }
            `}
                    >
                        <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-primary-500' : 'text-gray-400'}`} />
                        <div className={`text-sm font-medium ${isSelected ? 'text-primary-500' : 'text-gray-200'}`}>
                            {role.title}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                            {role.description}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RoleSelector;
