import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CareersService } from './careers.service';
import { CreateCareerDto, UpdateCareerDto } from './dto/career.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller({ path: 'careers', version: '1' })
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCareerDto: CreateCareerDto) {
    return this.careersService.create(createCareerDto);
  }

  @Get('stats/count')
  @UseGuards(JwtAuthGuard)
  getCount(@Query('active') active?: string) {
    const activeOnly = active === 'true';
    return this.careersService.getCount(activeOnly);
  }

  @Get()
  findAll(@Query('active') active?: string) {
    const activeOnly = active === 'true';
    return this.careersService.findAll(activeOnly);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.careersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateCareerDto: UpdateCareerDto) {
    return this.careersService.update(id, updateCareerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.careersService.remove(id);
  }
}
