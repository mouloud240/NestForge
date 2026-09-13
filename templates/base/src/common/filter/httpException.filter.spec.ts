import { BadRequestException } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './httpException.filter.js';

function mockHost(_exception: BadRequestException) {
  const json = vi.fn();
  const response = { status: vi.fn().mockReturnValue({ json }) };
  return {
    json,
    host: {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost,
  };
}

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('preserves validation error message array from getResponse()', () => {
    const exception = new BadRequestException([
      'email must be an email',
      'password is too weak',
    ]);
    const m = mockHost(exception);
    filter.catch(exception, m.host);

    const body = m.json.mock.calls[0][0];
    expect(body.statusCode).toBe(400);
    expect(body.message).toEqual([
      'email must be an email',
      'password is too weak',
    ]);
    expect(body.error).toBe('Bad Request');
    expect(body.success).toBe(false);
    expect(typeof body.timestamp).toBe('string');
  });

  it('handles a string message response', () => {
    const exception = new BadRequestException('Invalid credentials');
    const m = mockHost(exception);
    filter.catch(exception, m.host);

    const body = m.json.mock.calls[0][0];
    expect(body.statusCode).toBe(400);
    expect(body.message).toBe('Invalid credentials');
    expect(body.success).toBe(false);
  });
});