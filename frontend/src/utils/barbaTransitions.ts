import barba from '@barba/core';
import gsap from 'gsap';

export const initBarbaTransitions = () => {
  barba.init({
    transitions: [
      {
        name: 'default-transition',
        leave(data) {
          return gsap.to(data.current.container, {
            opacity: 0,
            y: -50,
            duration: 0.5,
            ease: 'power2.inOut',
          });
        },
        enter(data) {
          return gsap.from(data.next.container, {
            opacity: 0,
            y: 50,
            duration: 0.5,
            ease: 'power2.inOut',
          });
        },
      },
      {
        name: 'slide-transition',
        to: {
          namespace: ['experience', 'dashboard'],
        },
        leave(data) {
          return gsap.to(data.current.container, {
            opacity: 0,
            x: -100,
            duration: 0.6,
            ease: 'power3.inOut',
          });
        },
        enter(data) {
          return gsap.from(data.next.container, {
            opacity: 0,
            x: 100,
            duration: 0.6,
            ease: 'power3.inOut',
          });
        },
      },
      {
        name: 'fade-scale',
        to: {
          namespace: ['landing'],
        },
        leave(data) {
          return gsap.to(data.current.container, {
            opacity: 0,
            scale: 0.95,
            duration: 0.4,
            ease: 'power2.inOut',
          });
        },
        enter(data) {
          return gsap.from(data.next.container, {
            opacity: 0,
            scale: 1.05,
            duration: 0.4,
            ease: 'power2.inOut',
          });
        },
      },
    ],
    views: [
      {
        namespace: 'home',
        beforeEnter() {
          // Initialize home page animations
          gsap.from('.hero-content', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out',
          });
        },
      },
      {
        namespace: 'experience',
        beforeEnter() {
          // Initialize 3D scene
          document.body.classList.add('experience-active');
        },
        afterLeave() {
          document.body.classList.remove('experience-active');
        },
      },
    ],
  });
};

export const navigateWithTransition = (url: string) => {
  barba.go(url);
};
