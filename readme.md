# OpenAI o1-mini kod üretme denemesi
## 1 Kasım 2024
- o1 ile oluşturuldu.
- o1 mini tarifleri ve kodu kullanarak çok büyük ölçüde hiç değişiklik yapmadan üretilen kodlar çalıştı ve kodların derlenmesi, lokal ve uzak olarak test edilmesi ve dağıtılması mümkün oldu.
- o1 mini ek olarak bazı iyileştirme önerilerinde de bulundu ve kullanılacak teknolojileri isabetli olarak tanımladı. 
- o1 tarifleri üzerine bir iki değişiklik yapmak gerekti. Bu değişikliklerin tümü yine problem o1'e tarif edildikten sonra o1'in söylediği şekilde yapıldı. 
- package.json üzerinde uyarıları hata olarak değerlendirme değişikliği
- her bir harfe basıldığında kayıt ediyordu. bu zamana bağlı hale getirdi. 2000ms aktivite olmadığında kayıt ediyor.
- konu başlıklarını hiyererşik olarak tutacak şekilde backend yazdı ama frontend buna uyumlu değildi.
- frontend tarafında ilk seferde bir derleme hatası oluştu. hata o1'e yapıştırıldı ve hemen düzeltildi.
- python üzerinde print ifadesinin log stream üzerinde görüntülenmesi realtime olmuyor sanırım.
- Hem python hem de react frontend github actions üzerinde otomatik olarak derlenip azure üzerindeki backend servis ve frontend static web sayfaları üzerine gönderiliyor.
- o1 canvas ile bazı değişiklikleri tüm kod üzerinde yapmak oldukça pratik oluyor.
- Azure üzerinde react arayüz: https://brave-sea-02558b10f.5.azurestaticapps.net/
- Azure üzerinde backend servis: https://notetaker-evaff4gsghfeg0a2.germanywestcentral-01.azurewebsites.net/api/contents
- azure üzerindeki tüm kaynaklar ücretsiz kaynaklar olarak ayarlandı.


