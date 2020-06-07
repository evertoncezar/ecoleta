import { useState } from 'react';

const useModal = () => {
  const [isShowing, setIsShowing] = useState(false);

  function setShowingModal() {
    setIsShowing(!isShowing);
  }

  return {
    isShowing,
    setShowingModal,
  }
};

export default useModal;