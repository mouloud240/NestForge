import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationController } from './authentication.controller.js';
import { AuthenticationService } from './authentication.service.js';
import { UserService } from '../../user/v1/user.service.js';
import { LocalGuard } from '../guards/local.guard.js';
import { SessionAuthGuard } from '../guards/session.guard.js';
import { CsrfService } from '../../../common/modules/csrf/csrf.service.js';
import { OAuthStrategyRegistry } from '../oauth/oauth-strategy.registry.js';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // .register provides AuthModuleOptions required by passport AuthGuard mixins
      imports: [PassportModule.register({})],
      controllers: [AuthenticationController],
      providers: [
        { provide: AuthenticationService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: CsrfService, useValue: { generateToken: vi.fn() } },
        // Eager guard instantiation (Nest 12) needs the registry mock
        {
          provide: OAuthStrategyRegistry,
          useValue: { isEnabled: vi.fn().mockReturnValue(false) },
        },
        LocalGuard,
        SessionAuthGuard,
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
