import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router'

const HomeRedirect = () => {
    const { user, loading } = useAuth()
    
    if(loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-text-secondary font-medium animate-pulse">
                        Loading ...
                    </p>
                </div>
            </div>
        );
    }

    return user ? <Navigate to="/dashboard" replace/> : <Navigate to="/login" replace/>
}

export default HomeRedirect