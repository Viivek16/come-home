import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-slate-900 text-slate-100">
      <motion.h1
        className="text-4xl font-semibold tracking-tight"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Come Home
      </motion.h1>
    </main>
  );
}
