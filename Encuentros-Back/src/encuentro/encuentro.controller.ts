import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EncuentroService } from './encuentro.service';
import { CreateEncuentroDto } from './dto/create-encuentro.dto';
import { UpdateEncuentroDto } from './dto/update-encuentro.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('encuentro')
@UseGuards(JwtAuthGuard) // Protege todos los endpoints de encuentros
export class EncuentroController {
  constructor(private readonly encuentroService: EncuentroService) {}

  @Post()
  create(@Body() createEncuentroDto: CreateEncuentroDto) {
    return this.encuentroService.create(createEncuentroDto);
  }

  @Post('recomendaciones')
  @HttpCode(HttpStatus.OK)
  async recomendacionesIA(
    @Body()
    body: {
      intereses?: string[];
      eventos?: Array<Record<string, any>>;
    },
  ) {
    const intereses = body?.intereses ?? [];
    const eventos = body?.eventos ?? [];

    if (!Array.isArray(intereses) || intereses.length === 0) {
      throw new BadRequestException('Debes enviar al menos un interés para recomendar eventos.');
    }

    if (!Array.isArray(eventos) || eventos.length === 0) {
      throw new BadRequestException('Debes enviar una lista de eventos para evaluar.');
    }

    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3.2';

    const prompt = `
Eres un asistente que recomienda eventos para usuarios.
Tu respuesta debe ser SOLO un JSON válido, sin texto adicional.

Objetivo:
- Ordena los eventos según la relevancia para el usuario.
- Considera sus intereses, la categoría, descripción, fecha y ubicación si existen.
- Devuelve máximo 5 recomendaciones.

Usuario:
- intereses: ${intereses.join(', ')}

Eventos:
${JSON.stringify(eventos, null, 2)}

Formato exacto:
{
  "recomendaciones": [
    {
      "id": 1,
      "titulo": "string",
      "match": 0,
      "motivo": "string"
    }
  ]
}

Reglas:
- "match" debe ser un número del 0 al 100.
- "motivo" debe ser breve y claro.
- Si un evento no encaja, no lo incluyas.
- Responde únicamente con JSON válido.
`;

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama respondió con error: ${errorText}`);
      }

      const data = await response.json();
      const raw = data?.response ?? '{}';

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
          throw new Error('La respuesta de Ollama no vino en formato JSON válido');
        }
        parsed = JSON.parse(match[0]);
      }

      return {
        recomendaciones: Array.isArray(parsed?.recomendaciones) ? parsed.recomendaciones.slice(0, 5) : [],
      };
    } catch (error) {
      console.error('Error en recomendaciones IA:', error);
      throw new InternalServerErrorException(
        'No se pudieron generar recomendaciones. Verifica que Ollama esté corriendo en localhost:11434.',
      );
    }
  }

  @Get()
  findAll(@Query('creador') creador?: string) {
    const id = creador ? +creador : undefined;
    return this.encuentroService.findAll(id);
  }

  @Get('resumen')
  findAllWithResumen(@Query('creador') creador?: string) {
    const id = creador ? +creador : undefined;
    return this.encuentroService.findAllWithResumen(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.encuentroService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEncuentroDto: UpdateEncuentroDto,
    @Body('idUsuario') idUsuario: number,
  ) {
    return this.encuentroService.update(+id, updateEncuentroDto, idUsuario);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Body('idUsuario') idUsuario: number) {
    return this.encuentroService.remove(+id, idUsuario);
  }

  @Post(':id/salir')
  @HttpCode(HttpStatus.OK)
  salirDelEncuentro(@Param('id') id: string, @Body('idUsuario') idUsuario: number) {
    return this.encuentroService.salirDelEncuentro(+id, idUsuario);
  }
}
