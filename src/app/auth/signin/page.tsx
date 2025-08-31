'use client';

import { useAppContext } from '@/context/AppContext';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { useForm } from 'react-hook-form';
import { Button, TextField, Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

interface FormData {
  email: string;
  password: string;
}

export default function SignIn() {
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (data: FormData) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/');
    } catch (error) {
      enqueueSnackbar('Sign in failed', { variant: 'error' });
    }
  };

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      enqueueSnackbar('Google sign in failed', { variant: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4">Sign In</Typography>
      <TextField label="Email" {...register('email')} fullWidth margin="normal" />
      <TextField label="Password" type="password" {...register('password')} fullWidth margin="normal" />
      <Button type="submit" variant="contained" fullWidth>Sign In</Button>
      <Button onClick={googleSignIn} variant="outlined" fullWidth sx={{ mt: 2 }}>Sign In with Google</Button>
    </Box>
  );
}