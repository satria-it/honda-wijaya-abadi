import { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

const CompareContext = createContext(null);

const MAX = 3;

export const CompareProvider = ({ children }) => {
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);

  const isSelected = useCallback((id) => selected.some((m) => m.id === id), [selected]);

  const toggle = useCallback((motor) => {
    setSelected((prev) => {
      const exists = prev.some((m) => m.id === motor.id);
      if (exists) {
        return prev.filter((m) => m.id !== motor.id);
      }
      if (prev.length >= MAX) {
        toast.error(`Maksimal ${MAX} motor untuk dibandingkan`);
        return prev;
      }
      return [...prev, motor];
    });
  }, []);

  const remove = useCallback((id) => {
    setSelected((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const openCompare = useCallback(() => {
    if (selected.length < 2) {
      toast.error('Pilih minimal 2 motor untuk dibandingkan');
      return;
    }
    setOpen(true);
  }, [selected]);

  return (
    <CompareContext.Provider value={{ selected, isSelected, toggle, remove, clear, open, setOpen, openCompare, MAX }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
