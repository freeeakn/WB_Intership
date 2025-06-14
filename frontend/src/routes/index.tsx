import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Добро пожаловать</h1>
        <a href="/cities" className="btn btn-primary">
          Перейти к городам
        </a>
      </div>
    </motion.div>
  );
}
