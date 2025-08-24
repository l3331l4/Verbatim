import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmLeaveModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center"
            initial={{ scale: 0.9, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <h1 className="font-heading font-medium text-2xl mb-4 text-gray-800">
              Leave Meeting?
            </h1>
            <p className="text-gray-600 mb-6 font-body text-sm">
              If you leave this page, your transcript will be lost.
              <br />
              <br />
              Are you sure you want to leave?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="font-body px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-200/80"
                onClick={onCancel}
              >
                Stay
              </button>
              <button
                className="font-body px-4 py-2 rounded-xl bg-red-500/90 text-white font-medium hover:bg-red-500/80"
                onClick={onConfirm}
              >
                Leave
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
  