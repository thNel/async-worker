import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString({ message: 'Job name must be a string' })
  @IsNotEmpty({ message: "Job name can't be empty" })
  name!: string;
}
