/* eslint-disable prettier/prettier */

import { IsDateString, IsNotEmpty, IsString, IsUrl } from "class-validator";

export class ClubDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsDateString()
    @IsNotEmpty()
    fecha_fundacion: Date;

    @IsUrl()
    @IsNotEmpty()
    imagen: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;
}
