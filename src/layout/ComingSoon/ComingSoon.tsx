import styles from './ComingSoon.module.css';

export interface ComingSoonProps {
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>
          Этот раздел DION не входит в текущий прототип — в макете реализованы только
          «Почта» и «Доски».
        </p>
      </div>
    </div>
  );
}
