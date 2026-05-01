# Psy-Med-Advisor APP
**Patient-Centric Psychiatric Medication Analyzer**

Psy-Med-Advisor, psikiyatrik ilaç kullanan hastalar için geliştirilmiş, 
mekanizma şeffaflığı sağlayan ve kişiselleştirilmiş risk analizi yapan 
deterministik bir karar destek prototipidir.



## Projenin Amacı
Mevcut genel ilaç denetleyicilerindeki (Drugs.com, Medscape vb.) 
psikiyatriye özel derinlik eksikliğini ve hasta odaklı olmayan 
dil problemini çözmeyi hedefler.

**Sistemimiz şu parametrelere göre analiz yapar:**
* **Kişiselleştirme:** Yaş, kilo ve cinsiyete göre doz analizi.
* **Mekanizma Şeffaflığı:** CYP enzimleri ve reseptör seviyesinde DDI.
* **Besin Etkileşimi:** Alkol, kafein ve tiramin gibi spesifik uyarılar.
* **Güvenlik:** Deterministik motor sayesinde "hallucination" riskini önler.



## Kurulum ve Çalıştırma Rehberi
Uygulamayı yerel bilgisayarınızda ayağa kaldırmak için aşağıdaki adımları izleyin:

1. **Repoyu Klonlayın:**
   ```bash
   git clone https://github.com/mrtirn/Psy-Med-Advisor.git
   cd Psy-Med-Advisor
   ```

2. **Gerekli Kütüphaneleri Yükleyin:**
   *(Not: Streamlit gibi bağımlılıklar otomatik yüklenecektir)*
   ```bash
   pip install -r requirements.txt
   ```

3. **Uygulamayı Başlatın:**
   ```bash
   streamlit run app.py
   ```
   *Komutu çalıştırdıktan sonra uygulama varsayılan tarayıcınızda (genellikle localhost:8501) açılacaktır.*



## Teknik Mimari (Backbone)
Proje, modüler bir yapıda 4 ana Python dosyasından oluşur:

* **`models.py`**: `Drug` ve `Patient` sınıflarını (OOP) barındırır.
* **`analyzer.py`**: Doz, yolak (pathway) ve risk analiz motorudur.
* **`database_mgr.py`**: SQLite tabanlı yerel veri yönetimi (Manager).
* **`app.py`**: Streamlit tabanlı kullanıcı arayüzü ve ana merkezdir.



## Dosya Yapısı
```text
Psy-Med-Advisor/
├── app.py              # UI ve Ana Fonksiyon (Main Hub)
├── models.py           # Veri Sınıfları (Drug & Patient)
├── analyzer.py         # Analiz Algoritmaları
├── database_mgr.py     # Yerel SQLite Veritabanı Yönetimi
├── drugs.json          # 15 İlaçlık Klinik Bilgi Havuzu
├── requirements.txt    # Gerekli Kütüphaneler (Streamlit vb.)
├── README.md           # Proje Dokümantasyonu
└── benchmark/          # LLM Karşılaştırma Modülü
```



## Gizlilik ve Etik Notu
* **Veri Gizliliği:** Bu bir akademik prototiptir. Veriler herhangi bir sunucuya 
gönderilmez, sadece yerel `local_db.sqlite` dosyasında saklanır.
* **Sorumluluk Reddi:** Bu uygulama tıbbi bir tavsiye niteliği taşımaz; 
bilgilendirme amaçlıdır. Tedavi süreçleriniz için mutlaka doktorunuza danışın.