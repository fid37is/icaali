// app/page.js
import MainLayout from '../components/layout/MainLayout';
import Homepage from '../components/HomePage';

export default function Home() {
  return (
    <MainLayout>
      <Homepage />
    </MainLayout>
  );
}