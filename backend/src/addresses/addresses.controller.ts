import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller({ path: 'addresses', version: '1' })
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(createAddressDto, req.user.sub);
  }

  @Get()
  async findAll(@Request() req) {
    return this.addressesService.findAllByUser(req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.addressesService.findOne(id, req.user.sub);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, updateAddressDto, req.user.sub);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.addressesService.delete(id, req.user.sub);
  }

  @Put(':id/default')
  async setDefault(@Param('id') id: string, @Request() req) {
    return this.addressesService.setDefault(id, req.user.sub);
  }
}
