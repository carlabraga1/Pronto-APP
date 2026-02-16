import { Controller, Get, Post, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';

@Controller()
export class ProfessionalsController {
  constructor(private professionalsService: ProfessionalsService) {}

  @Get('categories')
  getCategories() {
    return this.professionalsService.getCategories();
  }

  @Post('categories/sync')
  syncCategories(@Body() categories: { name: string; icon: string; subcategories?: { name: string; icon: string }[] }[]) {
    return this.professionalsService.syncCategories(categories);
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
