import React, { useEffect, useRef, useState } from 'react';
import style from './takeover.module.scss';
import CloseButton from '@/components/shared/closeButton/closeButton';
import clsx from 'clsx';
import { useRouter } from 'next/router';

export default function Takeover({
  children,
  styles,
  handleClose,
  showTakeover,
  classNames,
  modalClassNames,
  queryParam = '',
  hideCloseButton = false,
}) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const closeModal = () => {
    const body = document.getElementsByTagName('body')[0];
    body.style.overflow = 'unset';
    handleClose ? handleClose() : setIsModalOpen(false);
  };

  // Stop scroll of page only if modal content is shorter than the rest of the page
  const takeoverRef = useRef();
  useEffect(() => {
    const windowHeight = window.innerHeight;
    const takeoverHeight = takeoverRef.current.clientHeight;
    const body = document.getElementsByTagName('body')[0];
    if (windowHeight >= takeoverHeight) {
      body.style.overflow = 'hidden';
    }
    return () => {
      body.style.overflow = 'visible';
    };
  }, []);

  const isOpen = showTakeover ? showTakeover : isModalOpen;

  // If modal is shorter than window height, center it veritcally, otherwise align it near top of page
  const modalRef = useRef();
  const [alignCenter, setAlignCenter] = useState(true);
  useEffect(() => {
    if (modalRef?.current) {
      const windowHeight = window.innerHeight;
      const modalHeight = modalRef.current.clientHeight;
      if (modalHeight > windowHeight) {
        setAlignCenter(false);
      } else {
        setAlignCenter(true);
      }
    }
  }, [modalRef]);

  // Add query param when takeover opens if prop exists
  // const router = useRouter();
  // useEffect(() => {
  //   if (queryParam) {
  //     router.push(
  //       {
  //         query: {
  //           [queryParam]: true,
  //         },
  //       },
  //       undefined,
  //       {
  //         shallow: true,
  //       }
  //     );
  //   }
  //   // Remove query param when takeover closes
  //   return () => {
  //     router.push(
  //       {
  //         query: {},
  //       },
  //       undefined,
  //       {
  //         shallow: true,
  //       }
  //     );
  //   };
  // }, []);

  return (
    <>
      {isOpen && (
        <div
          className={clsx(style.takeover, classNames)}
          style={{
            alignItems: alignCenter ? 'center' : 'flex-start',
            ...styles,
          }}
          ref={takeoverRef}
        >
          <div className={clsx(style.modal, modalClassNames)} ref={modalRef}>
            {children}
            {!hideCloseButton && <CloseButton handleClick={closeModal} />}
          </div>
        </div>
      )}
    </>
  );
}
