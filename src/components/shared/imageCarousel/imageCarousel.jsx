import { useState, useEffect, useRef } from 'react';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import Image from 'next/image';
import styles from './imageCarousel.module.scss';
import Takeover from '../takeover/takeover';
import Thumbnails from './thumbnails/thumbnails';
import Video from './video/video';

export default function ImageCarousel({
  images = [],
  hideThumbnails = false,
  classNames = '',
  height = 300,
}) {
  const [index, setIndex] = useState(0);
  const [showVideoTakeover, setShowVideoTakeover] = useState(false);

  // fadeIn animation
  const imageRef = useRef();
  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.className = `${styles.image} ${styles.fadeIn}`;
      setTimeout(() => {
        imageRef.current.className = `${styles.image}`;
      }, 300);
    }
  }, [index, imageRef]);

  if (!images?.length) return;
  const currentImage = images[index];

  const handleClickLeft = () => {
    if (index === 0) setIndex(images.length - 1);
    else setIndex(index - 1);
  };
  const handleClickRight = () => {
    if (index + 1 === images.length) setIndex(0);
    else setIndex(index + 1);
  };

  return (
    <div className={classNames}>
      <div className={styles.carouselContainer}>
        <button onClick={handleClickLeft} className={styles.chevronLeft}>
          <FontAwesomeIcon icon={faChevronLeft} color="white" size="2xl" />
        </button>
        <div className={styles.mediaContainer}>
          {currentImage.type === 'video/quicktime' ? (
            <Video
              videoSrc={currentImage.url}
              showVideoTakeover={showVideoTakeover}
              setShowVideoTakeover={setShowVideoTakeover}
            />
          ) : (
            <Image
              src={currentImage.url}
              height={currentImage.height}
              width={currentImage.width}
              alt=""
              className={styles.image}
              ref={imageRef}
              quality={50}
              style={{ maxHeight: `${height}px` }}
            />
          )}
          <button onClick={handleClickRight} className={styles.chevronRight}>
            <FontAwesomeIcon icon={faChevronRight} color="white" size="2xl" />
          </button>
          <div className={styles.dotContainer}>
            {images.map((_, dotIndex) => {
              const isActive = dotIndex === index;
              return (
                <div
                  className={clsx(styles.dot, isActive && styles.active)}
                  key={`dot-${dotIndex}`}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
      {!hideThumbnails && (
        <Thumbnails images={images} index={index} setIndex={setIndex} />
      )}
      {showVideoTakeover && (
        <Takeover
          modalClassNames={styles.videoTakeover}
          handleClose={() => setShowVideoTakeover(false)}
        >
          <video
            autoPlay
            controls
            src={currentImage.url}
            className={styles.takeoverVideo}
            muted
          />
        </Takeover>
      )}
    </div>
  );
}
