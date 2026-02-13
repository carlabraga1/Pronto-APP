import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';

@Controller()
export class ProfessionalsController {
  constructor(private professionalsService: ProfessionalsService) {}

  @Get('categories')
  getCategories() {
    return this.professionalsService.getCategories();
  }

  @Get('professionals')
  findAll(@Query('category') category?: string) {
    return this.professionalsService.findAll(category);
  }

  @Get('professionals/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.professionalsService.findOne(id);
  }
}
