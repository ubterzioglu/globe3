const ERROR_MESSAGES: Record<string, string> = {
  invalid_body: 'Gönderilen veri geçersiz.',
  validation_error: 'Lütfen alanları kontrol edin.',
  unauthenticated: 'Bu işlem için giriş yapmanız gerekiyor.',
  forbidden: 'Bu işlem için yetkiniz yok.',
  not_found: 'Kayıt bulunamadı.',
  conflict: 'Bu kayıt zaten mevcut.',
  place_not_city_level: 'Seçilen konum şehir düzeyinde değil. Lütfen bir şehir seçin.',
  place_not_found: 'Konum bulunamadı.',
  rate_limited: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
  google_upstream_error: 'Konum servisi şu an kullanılamıyor.',
  db_insert_failed: 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.',
  internal_error: 'Beklenmeyen bir hata oluştu.',
  network_error: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
};

export function mapApiErrorToMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? 'Bilinmeyen bir hata oluştu.';
}
