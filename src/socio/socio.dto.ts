/* eslint-disable prettier/prettier */

import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class SocioDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    correo: string;

    @IsNotEmpty()
    @IsDateString()
    fecha_nacimiento: string;
}
