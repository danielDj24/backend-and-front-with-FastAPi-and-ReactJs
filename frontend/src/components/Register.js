import React, {useState} from "react";
import { axiosInstance } from './axiosConfig';

const Register = () => {
    <div>
    <h2>Register Page</h2>
    </div>
    const [formData, setFormData ] = useState(
        {
            username : '',
            email : '',
            password : ''
        });

        const handleChange = (e) =>{
            const {name, value} = e.target;
            setFormData({
                ...FormData,
                [name]:value
            });
        };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/register', formData);
            console.log('Registration succesful:', response.data);
        }catch(error){
            console.error('Error during registration', error);
        }
    };
    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>username:</label>
                    <input 
                    type = "text"
                    name = "username"
                    value={formData.username}
                    onChange={handleChange}
                    />
                </div>
                <div>
                    <label>email:</label>
                    <input
                    type = "email"
                    name = "email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    />
                </div>
                <div>
                    <label>password:</label>
                    <input 
                    type = "password"
                    name = "password"
                    value = {formData.password}
                    required
                    />
                </div>
            </form>
        </div>
    );
};

export default Register;