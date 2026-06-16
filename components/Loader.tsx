"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Loader() {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("tecnova-loader-seen");

    if (!seen) {
      sessionStorage.setItem("tecnova-loader-seen", "true");

      const startTimer = setTimeout(() => setShow(true), 0);
      const timer = setTimeout(() => {
        setShow(false);
        setReady(true);
      }, 2400);

      return () => {
        clearTimeout(startTimer);
        clearTimeout(timer);
      };
    }

    const readyTimer = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(readyTimer);
  }, []);

  useEffect(() => {
    if (!ready) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [ready]);

  return (
    <>
      {!ready && <div className="fixed inset-0 z-[9998] bg-white" />}

      <AnimatePresence>
        {show && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, y: -10 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-tecnova-red/20 blur-3xl"
                animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.45, 0.25] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              <motion.div
                className="relative h-48 w-48 sm:h-64 sm:w-64"
                animate={{ scale: [1, 1.035, 1], opacity: [1, 0.96, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <Image
                  src="/tecnova-loader.png"
                  alt="Tecnova Perú"
                  fill
                  sizes="(max-width: 640px) 192px, 256px"
                  className="object-contain"
                />
              </motion.div>

              <motion.div
                className="mx-auto mt-8 h-[3px] w-44 overflow-hidden rounded-full bg-neutral-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full rounded-full bg-tecnova-red"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
