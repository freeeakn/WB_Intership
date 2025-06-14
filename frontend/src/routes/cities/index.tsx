import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import CityList from '../../components/ui/CityList'

export const Route = createFileRoute('/cities/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">Список городов</h1>
          {isLoading && <div className="text-center">Загрузка...</div>}
          {error && <div className="text-red-500">Ошибка: {error.message}</div>}
          {data && <CityList cities={data} />}
        </div>
      </motion.div>
}
