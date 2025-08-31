'use client';

import { useAppContext } from '@/context/AppContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { setDoc, doc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { Button, TextField, Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

interface FormData {
  email: string;
  password: string;
}

export default function SignUp() {
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (data: FormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        preferences: { categories: [], location: null },
        earnings: 0,
      });
      router.push('/');
    } catch (error) {
      enqueueSnackbar('Sign up failed', { variant: 'error' });
    }
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        preferences: { categories: [], location: null },
        earnings: 0,
      }, { merge: true });
      router.push('/');
    } catch (error) {
      enqueueSnackbar('Google sign up failed', { variant: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4">Sign Up</Typography>
      <TextField label="Email" {...register('email')} fullWidth margin="normal" />
      <TextField label="Password" type="password" {...register('password')} fullWidth margin="normal" />
      <Button type="submit" variant="contained" fullWidth>Sign Up</Button>
      <Button onClick={googleSignIn} variant="outlined" fullWidth sx={{ mt: 2 }}>Sign Up with Google</Button>
    </Box>
  );
}