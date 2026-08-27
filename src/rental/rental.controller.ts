import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException, UseGuards } from "@nestjs/common";
import { RentalService } from "./rental.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { PermissionsGuard } from "src/common/guard/permissions.guard";
import { Permissions } from "src/common/decorators/permissions.decorator";
import { RentalCreateDTO } from "./dto/rental-create.dto";
import { ClientInfoDecorator } from "src/common/decorators/client-info.decorator";
import type { ClientInfo } from "src/common/interfaces/client-info.interface";

@Controller('api/rentel')
export class RentalController {
    constructor(
        private readonly rentalService: RentalService
    ) { }


    @Post('/calculate-rental/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:create-rental')
    CalculateCost(
        @Headers("authorization") authHeader: string,
        @Body() dto: RentalCreateDTO,
        @Param('id') productID: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.CalculateRentalCost(
            token,
            productID,
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Post('/create-rental/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:create-rental')
    CreateRental(
        @Headers("authorization") authHeader: string,
        @Body() dto: RentalCreateDTO,
        @Param('id') productID: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.RentTool(
            token,
            productID,
            dto,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('/rented-list')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:fetch-rental-list')
    FetchRentalList(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.RentalList(token)
    }

    @Get('/rent-recode/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:fetch-rental-recode')
    FetchRentalRecode(
        @Headers("authorization") authHeader: string,
        @Param('id') id: string
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.RentReocde(token, id)
    }

    @Post('/return-tool/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:return-tool')
    ReturnTool(
        @Headers("authorization") authHeader: string,
        @Param('id') rentalID: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.ReturnTool(
            token,
            rentalID,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('/fetch-late-fees')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:fetch-late-fees')
    FetchLateFees(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.FetchLateFees(token)
    }

    @Get('/fetch-late-fee/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:fetch-late-fee')
    FetchLateFee(
        @Headers("authorization") authHeader: string,
        @Param('id') overdueID: string
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.FetchLateFee(token, overdueID)
    }

    @Post('/request-to-pay-overdue/:id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:request-pay-overdue')
    RequstToPayOverDue(
        @Headers("authorization") authHeader: string,
        @Param('id') overdueID: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.RequesttoPayOverDue(
            token,
            overdueID,
            client.ipAddress,
            client.userAgent
        )
    }

    @Get('/my-rental-tools')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:request-my-tools')
    FetchMyRentalTools(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.FetchMyRenttools(
            token,
        )
    }

    @Get('/my-late-fees')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:my-late-fees')
    FetchMyLateFees(
        @Headers("authorization") authHeader: string,
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.MyLateFees(token)
    }

    @Post('/clear-late-fees')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @Permissions('rental:clear-late-fees')
    ClearLateFees(
        @Headers("authorization") authHeader: string,
        @Body('cost') cost: string,
        @ClientInfoDecorator() client: ClientInfo
    ) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        const token = authHeader.split(" ")[1];

        return this.rentalService.ClearLateFees(
            token,
            cost,
            client.ipAddress,
            client.userAgent
        )
    }
}