import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './services/search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResultDto } from './dto/search-result.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() dto: SearchQueryDto): Promise<SearchResultDto> {
    return this.searchService.search(dto);
  }
}
