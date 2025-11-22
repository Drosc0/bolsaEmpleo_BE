import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/user/user.entity';

@Controller('stats')
export class StatsController {
    constructor(private readonly userService: UserService) { }

    @Public()
    @Get()
    async getStats() {
        const totalUsers = await this.userService.countAll();
        const aspirants = await this.userService.countByRole(UserRole.ASPIRANTE);
        const companies = await this.userService.countByRole(UserRole.EMPRESA);

        return {
            totalUsers,
            aspirants,
            companies,
        };
    }
}
