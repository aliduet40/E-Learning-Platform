import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ value, onChange, placeholder = "Password", name = "password" }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {placeholder}
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    id={name}
                    name={name}
                    type={showPassword ? "text" : "password"}
                    required
                    value={value}
                    onChange={onChange}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;
