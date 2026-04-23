// frontend/src/components/Auth.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setToken }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Change URL if deploying later (For now, localhost)
    const API_URL = 'https://dsa-graph-logistics.onrender.com/api/auth'; // ✅ CORRECT
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? '/login' : '/register';
        
        try {
            const res = await axios.post(API_URL + endpoint, formData);
            if (isLogin) {
                // Save token to localStorage and State
                localStorage.setItem('token', res.data.token);
                setToken(res.data.token);
                navigate('/dashboard'); // Redirect to Graph Builder
            } else {
                // If registered, switch to login
                alert('Registration Successful! Please Login.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2>{isLogin ? 'Logistics Login' : 'Create Account'}</h2>
                {error && <p style={{color: 'red'}}>{error}</p>}
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    {!isLogin && (
                        <input name="username" placeholder="Username" onChange={handleChange} required style={styles.input} />
                    )}
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={styles.input} />
                    
                    <button type="submit" style={styles.button}>
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <p style={{marginTop: '15px', cursor: 'pointer', color: '#007bff'}} onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "New user? Create an account" : "Already have an account? Login"}
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' },
    card: { background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '300px' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
    button: { padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Auth;
