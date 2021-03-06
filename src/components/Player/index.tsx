import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css'

import { usePlayer } from '../../hooks/usePlayer';

import S from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    hasPrevious,
    hasNext,
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    playNext,
    playPrevious,
    setIsPlayingState,
    clearPlayerState,
  } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;

    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext()
    } else {
      setProgress(0);
      clearPlayerState();
    }
  }

  const episode = episodeList[currentEpisodeIndex]
  
  return (
    <div className={S.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora"/>
        <span>Tocando agora</span>
      </header>

      { episode ? (
        <div className={S.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit='cover'
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
          <div className={S.emptyPlayer}>
            <strong>Selecione um podcast para ouvir</strong>
          </div>
      ) }


      <footer className={!episode ? S.empty : ''}>
        <div className={S.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={S.slider}>
            { episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={S.emptySlider} />
            ) }
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        { episode && (
          <audio
            src={episode.url}
            ref={audioRef}
            loop={isLooping}
            autoPlay
            onEnded={handleEpisodeEnded}
            onLoadedMetadata={setupProgressListener}
            onPlay={() => setIsPlayingState(true)}
            onPause={() => setIsPlayingState(false)}
          />
        ) }

        <div className={S.buttons}>
          <button
            type="button"
            disabled={!episode || episodeList.length === 1}
            className={isShuffling ? S.isActive : ''}  
            onClick={toggleShuffle}
          >
            <img src="./shuffle.svg" alt="Aleat??rio"/>
          </button>
          <button
            type="button" 
            disabled={!episode || !hasPrevious}
            onClick={playPrevious}
          >
            <img src="./play-previous.svg" alt="Anterior"/>
          </button>
          <button
            type="button"
            className={S.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            { isPlaying 
              ? <img src="./pause.svg" alt="Pausar"/>
              : <img src="./play.svg" alt="Reproduzir"/>
            }
          </button>
          <button
            type="button"
            disabled={!episode || !hasNext}
            onClick={playNext}
          >
            <img src="./play-next.svg" alt="Pr??xima"/>
          </button>
          <button
            type="button"
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? S.isActive : ''}  
          >
            <img src="./repeat.svg" alt="Repetir"/>
          </button>
        </div>
      </footer>
    </div>
  )
}