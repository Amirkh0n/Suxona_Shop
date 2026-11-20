import { act, renderHook } from '@testing-library/react';
import { I18nProvider, useI18n } from './index';
import uz from './uz';
import ru from './ru';

const wrapper = ({ children }) => <I18nProvider>{children}</I18nProvider>;

beforeEach(() => localStorage.clear());

describe('i18n', () => {
  it('every Uzbek key has a Russian translation', () => {
    expect(Object.keys(ru).sort()).toEqual(Object.keys(uz).sort());
  });

  it('switches language, interpolates and persists', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('nav.cart')).toBe('Savat');
    act(() => result.current.setLang('ru'));
    expect(result.current.t('nav.cart')).toBe('Корзина');
    expect(result.current.t('list.page', { n: 3 })).toBe('Страница 3');
    expect(localStorage.getItem('suxona_lang')).toBe('ru');
  });

  it('falls back to the key when unknown', () => {
    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('no.such.key')).toBe('no.such.key');
  });
});
