import React, { useState } from 'react';
import "./login.css";
import { doc, setDoc } from "firebase/firestore"; 
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import upload from '../../lib/upload';

const Login = () => {
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    });
    const [loading, setLoading] = useState(false);

    const handleAvatar = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');

        if (!username || !email || !password) {
            toast.error("Please fill out all fields");
            setLoading(false);
            return;
        }

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            // let imgUrl = "";
            // if (avatar.file) {
            //     imgUrl = await upload(avatar.file);
            // }

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                // avatar: imgUrl,
                id: res.user.uid,
                blocked: []
            });
            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });

            toast.success("Account created! You can log in now!");
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login'>
            <div className="item">
                <h2>Welcome Back</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder='Email' name="email" />
                    <input type="password" name="password" placeholder='Password' />
                    <button disabled={loading}>{loading ? "Loading..." : "Sign In"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">Upload Image</label>
                    <img src={avatar.url || "./avatar.png"} alt="Avatar" />
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
                    <input type="text" name="username" placeholder="Username" />
                    <input type="text" placeholder='Email' name="email" />
                    <input type="password" name="password" placeholder='Password' />
                    <button disabled={loading}>{loading ? "Loading..." : "Sign Up"}</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
