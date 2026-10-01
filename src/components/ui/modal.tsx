"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";
import { Button, Modal } from "antd";

type ModalContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openModal: () => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used inside ModalComponent");
  }

  return context;
};

type ModalComponentProps = {
  children: ReactNode;
  buttonText?: string;
  button?: ReactNode;
  loading?: boolean;
  width?: number;
};

const ModalComponent = ({
  children,
  buttonText,
  button,
  width,
  loading = false,
}: ModalComponentProps) => {
  const [open, setOpen] = useState(false);

  const openModal = () => {
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        open,
        setOpen,
        openModal,
        closeModal,
      }}
    >
      <>
        {button ? (
          <div onClick={openModal}>{button}</div>
        ) : (
          <Button type="default" onClick={openModal}>
            {buttonText || "Open Modal"}
          </Button>
        )}

        <Modal
          open={open}
          confirmLoading={loading}
          onCancel={closeModal}
          footer={null}
          width={width || 1000}
        >
          {children}
        </Modal>
      </>
    </ModalContext.Provider>
  );
};

export default ModalComponent;
