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
import { PressService } from './press.service';
import { CreatePressDto, UpdatePressDto } from './dto/press.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PressType } from './schemas/press.schema';

@Controller({ path: 'press', version: '1' })
export class PressController {
  constructor(private readonly pressService: PressService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPressDto: CreatePressDto) {
    return this.pressService.create(createPressDto);
  }

  @Get('stats/count')
  @UseGuards(JwtAuthGuard)
  getCount(@Query('active') active?: string, @Query('type') type?: PressType) {
    const activeOnly = active === 'true';
    return this.pressService.getCount(activeOnly, type);
  }

  @Get()
  findAll(@Query('active') active?: string, @Query('type') type?: PressType) {
    const activeOnly = active === 'true';
    return this.pressService.findAll(activeOnly, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pressService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updatePressDto: UpdatePressDto) {
    return this.pressService.update(id, updatePressDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.pressService.remove(id);
  }
}
