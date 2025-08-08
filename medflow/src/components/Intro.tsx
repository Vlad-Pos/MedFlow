import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ANIM } from '../utils/animation'

export default function Intro() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('medflow-intro')
    if (!seen) {
      setShow(true)
      setTimeout(() => {
        setShow(false)
        sessionStorage.setItem('medflow-intro', '1')
      }, ANIM.duration.intro * 1000)
    }
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--medflow-bg)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: ANIM.duration.base, ease: ANIM.ease.inOut } }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: ANIM.duration.intro, ease: ANIM.ease.inOut }}
            className="flex flex-col items-center"
          >
            <img src="/src/assets/medflow-logo.svg" alt="MedFlow" className="h-16 w-16" />
            <div className="mt-3 text-2xl font-semibold text-gray-100">MedFlow</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}