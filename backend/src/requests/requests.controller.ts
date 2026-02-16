import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateStatusDto, AssignProfessionalDto, CreateReviewDto } from './dto/create-request.dto';

@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.id, dto);
  }

  @Patch(':id/assign')
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignProfessionalDto,
  ) {
    return this.requestsService.assign(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.requestsService.updateStatus(id, dto);
  }

  @Post(':id/review')
  createReview(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.requestsService.createReview(req.user.id, id, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.requestsService.findOne(id);
  }

  @Get()
  findAll(@Req() req: any, @Query('me') me?: string) {
    if (me === '1') {
      return this.requestsService.findMyRequests(req.user.id);
    }
    return this.requestsService.findMyRequests(req.user.id);
  }
}
