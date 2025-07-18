import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Check } from 'typeorm';
import { JobStatus } from '@async-workers/shared-types';

const jobStatusValues = Object.values(JobStatus).map((v) => `'${v}'`).join(', ');

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text', { nullable: false })
  name!: string;

  @Column('text', {
    default: JobStatus.Queued,
    transformer: {
      from(value: string): JobStatus {
        return value as JobStatus;
      },
      to(value: JobStatus): string {
        return value;
      },
    },
    nullable: false,
  })
  @Check(`"status" IN (${jobStatusValues})`)
  status!: JobStatus;

  // для НЕ SQLite баз данных, можно использовать enum напрямую
  // @Column({
  //   type: 'enum',
  //   enum: JobStatus,
  //   default: JobStatus.Queued,
  // })
  // status!: JobStatus;

  @Column('int', { default: 0, nullable: false })
  progress!: number;

  @Column('text', {
    default: "[]",
    nullable: false,
    transformer: {
      from(value: string | any[]): string[] {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (e) {
            console.warn(`Invalid JSON in "logs": ${value}`);
            return [];
          }
        } else if (Array.isArray(value)) {
          return value;
        } else {
          console.warn(`Unexpected type for "logs":`, value);
          return [];
        }
      },
      to(value: string[]): string {
        return JSON.stringify(value);
      }
    },
  })
  logs!: string[];

  // Для НЕ SQLite баз данных можно использовать массивы
  // @Column('text', { array: true, default: [], nullable: false })
  // logs!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}