<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Place;
use App\Models\Category;

class PlacesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear o obtener categorías
        $categoriaParques = Category::firstOrCreate(
            ['slug' => 'parques-y-mas'],
            [
                'name' => 'Parques y Más',
                'description' => 'Parques naturales, regionales y jardines botánicos',
                'icon' => ''
            ]
        );

        $categoriaAcuaticos = Category::firstOrCreate(
            ['slug' => 'paraisos-acuaticos'],
            [
                'name' => 'Paraísos Acuáticos',
                'description' => 'Lagos, lagunas, ríos, cascadas y balnearios',
                'icon' => ''
            ]
        );

        $categoriaMontanosos = Category::firstOrCreate(
            ['slug' => 'lugares-montanosos'],
            [
                'name' => 'Lugares Montañosos',
                'description' => 'Cerros, altos, reservas naturales y miradores',
                'icon' => ''
            ]
        );

        // Lugares de Parques y Más
        $parques = [
            [
                'name' => 'Parque Nacional Natural Tatamá',
                'location' => 'Pueblo Rico, Risaralda',
                'description' => 'Uno de los parques nacionales más importantes de Colombia, ubicado en la cordillera occidental. Alberga una gran diversidad de flora y fauna, incluyendo especies endémicas. Ideal para ecoturismo, observación de aves y senderismo. El parque cuenta con diferentes pisos térmicos que van desde el bosque húmedo tropical hasta el páramo.',
                'image' => 'https://picsum.photos/id/1015/400/300',
                'latitude' => 5.2345,
                'longitude' => -76.1234,
            ],
            [
                'name' => 'Parque Las Araucarias',
                'location' => 'Santa Rosa de Cabal, Risaralda',
                'description' => 'Hermoso parque natural conocido por sus impresionantes árboles de araucaria. Ofrece senderos ecológicos, áreas de descanso y la oportunidad de disfrutar de la naturaleza en un ambiente tranquilo. Perfecto para familias y amantes de la naturaleza que buscan un día de relajación y conexión con el medio ambiente.',
                'image' => 'https://picsum.photos/id/1018/400/300',
                'latitude' => 4.8765,
                'longitude' => -75.6543,
            ],
            [
                'name' => 'Parque Regional Natural Cuchilla de San Juan',
                'location' => 'Belén de Umbría, Risaralda',
                'description' => 'Área protegida que conserva importantes ecosistemas de bosque andino. El parque es hogar de diversas especies de aves y mamíferos. Cuenta con senderos interpretativos que permiten a los visitantes conocer la biodiversidad local mientras disfrutan de paisajes montañosos espectaculares.',
                'image' => 'https://picsum.photos/id/1020/400/300',
                'latitude' => 5.0123,
                'longitude' => -75.7890,
            ],
            [
                'name' => 'Parque Natural Regional Santa Emilia',
                'location' => 'Belén de Umbría, Risaralda',
                'description' => 'Parque regional que protege importantes fuentes hídricas y ecosistemas estratégicos. Ideal para actividades de ecoturismo, investigación y educación ambiental. Los visitantes pueden disfrutar de caminatas, observación de flora y fauna, y aprender sobre la importancia de la conservación de los recursos naturales.',
                'image' => 'https://picsum.photos/id/1021/400/300',
                'latitude' => 5.0456,
                'longitude' => -75.8123,
            ],
            [
                'name' => 'Jardín Botánico UTP',
                'location' => 'Pereira, Risaralda',
                'description' => 'Jardín botánico perteneciente a la Universidad Tecnológica de Pereira, dedicado a la conservación, investigación y educación sobre la flora regional. Cuenta con colecciones de plantas nativas, senderos educativos y espacios para la investigación científica. Es un lugar perfecto para aprender sobre la biodiversidad del Eje Cafetero.',
                'image' => 'https://picsum.photos/id/1022/400/300',
                'latitude' => 4.8136,
                'longitude' => -75.6961,
            ],
            [
                'name' => 'Jardín Botánico De Marsella',
                'location' => 'Marsella, Risaralda',
                'description' => 'Hermoso jardín botánico que muestra la riqueza florística de la región. Cuenta con una amplia variedad de especies vegetales organizadas en diferentes secciones temáticas. Ideal para visitantes que buscan conocer la flora local, disfrutar de un ambiente tranquilo y participar en actividades educativas sobre botánica y conservación.',
                'image' => 'https://picsum.photos/id/1023/400/300',
                'latitude' => 4.9378,
                'longitude' => -75.7456,
            ],
        ];

        // Lugares Acuáticos
        $acuaticos = [
            [
                'name' => 'Lago De La Pradera',
                'location' => 'La Pradera - Dosquebradas, Risaralda',
                'description' => 'Hermoso lago artificial rodeado de naturaleza, ideal para actividades recreativas y deportes acuáticos. El lugar cuenta con áreas de picnic, senderos alrededor del lago y espacios para la pesca deportiva. Es un destino popular para familias que buscan un día de esparcimiento al aire libre en un ambiente tranquilo y seguro.',
                'image' => 'https://picsum.photos/id/1001/400/300',
                'latitude' => 4.8234,
                'longitude' => -75.7123,
            ],
            [
                'name' => 'La Laguna Del Otún',
                'location' => 'Pereira, Santa Rosa, Risaralda',
                'description' => 'Una de las lagunas más importantes del departamento, ubicada en el Parque Nacional Natural Los Nevados. Es un destino de alta montaña que requiere preparación física, pero ofrece paisajes espectaculares y la oportunidad de observar fauna silvestre. La laguna es fuente de agua para la región y un importante ecosistema de páramo.',
                'image' => 'https://picsum.photos/id/1002/400/300',
                'latitude' => 4.7890,
                'longitude' => -75.3456,
            ],
            [
                'name' => 'Chorros De Don Lolo',
                'location' => 'Santa Rosa, Risaralda',
                'description' => 'Impresionante cascada natural que forma parte de un complejo turístico en Santa Rosa de Cabal. Los visitantes pueden disfrutar de las aguas termales, la cascada y los hermosos paisajes naturales. El lugar cuenta con infraestructura turística que incluye piscinas termales, restaurantes y áreas de descanso.',
                'image' => 'https://picsum.photos/id/1003/400/300',
                'latitude' => 4.8678,
                'longitude' => -75.6234,
            ],
            [
                'name' => 'Termales de Santa Rosa',
                'location' => 'Santa Rosa, Risaralda',
                'description' => 'Famosos termales naturales con aguas ricas en minerales que ofrecen propiedades terapéuticas. El complejo cuenta con piscinas de diferentes temperaturas, spa, restaurante y alojamiento. Es uno de los destinos más populares de Risaralda para relajación y bienestar, rodeado de un hermoso paisaje montañoso.',
                'image' => 'https://picsum.photos/id/1004/400/300',
                'latitude' => 4.8567,
                'longitude' => -75.6345,
            ],
            [
                'name' => 'Parque Acuático Consota',
                'location' => 'Pereira - Cerritos, Risaralda',
                'description' => 'Parque acuático familiar con piscinas, toboganes y áreas recreativas. Ideal para pasar un día divertido en familia, especialmente durante el verano. El parque cuenta con restaurantes, áreas de picnic y espacios verdes para descansar. Es un destino popular para residentes locales y turistas que buscan diversión acuática.',
                'image' => 'https://picsum.photos/id/1005/400/300',
                'latitude' => 4.8123,
                'longitude' => -75.6789,
            ],
            [
                'name' => 'Balneario Los Farallones',
                'location' => 'La Virginia, Risaralda',
                'description' => 'Balneario natural en las orillas del río Cauca, perfecto para refrescarse y disfrutar de un día al aire libre. El lugar cuenta con áreas de descanso, restaurantes típicos y espacios para actividades recreativas. Es un destino popular durante los fines de semana y festivos, ideal para familias y grupos de amigos.',
                'image' => 'https://picsum.photos/id/1006/400/300',
                'latitude' => 4.9012,
                'longitude' => -75.8901,
            ],
            [
                'name' => 'Cascada Los Frailes',
                'location' => 'La Florida - Pereira, Risaralda',
                'description' => 'Hermosa cascada natural accesible a través de un sendero ecológico. El lugar ofrece la oportunidad de disfrutar de la naturaleza, tomar fotografías y refrescarse en las aguas cristalinas. Es un destino ideal para excursionistas y amantes de la naturaleza que buscan una experiencia tranquila y relajante.',
                'image' => 'https://picsum.photos/id/1007/400/300',
                'latitude' => 4.8345,
                'longitude' => -75.7012,
            ],
            [
                'name' => 'Río San José',
                'location' => 'Cordillera Central - Pereira, Risaralda',
                'description' => 'Río de aguas cristalinas que atraviesa hermosos paisajes naturales. El lugar es ideal para actividades como senderismo, observación de aves y disfrutar de la naturaleza. Los visitantes pueden caminar por senderos que bordean el río y disfrutar de la tranquilidad del ambiente natural.',
                'image' => 'https://picsum.photos/id/1008/400/300',
                'latitude' => 4.7890,
                'longitude' => -75.7234,
            ],
        ];

        // Lugares Montañosos
        $montanosos = [
            [
                'name' => 'Alto Del Nudo',
                'location' => 'Pereira, Risaralda',
                'description' => 'Mirador natural que ofrece vistas panorámicas espectaculares de la ciudad de Pereira y el valle del río Otún. Es un destino popular para amaneceres y atardeceres, ideal para fotografía y contemplación. El lugar cuenta con áreas de descanso y es accesible en vehículo, lo que lo convierte en un destino fácil para todos.',
                'image' => 'https://picsum.photos/id/1035/400/300',
                'latitude' => 4.8234,
                'longitude' => -75.7123,
            ],
            [
                'name' => 'Alto Del Toro',
                'location' => 'Pereira, Risaralda',
                'description' => 'Otro importante mirador de la región que ofrece vistas impresionantes del paisaje cafetero. El lugar es ideal para actividades como parapente, fotografía y simplemente disfrutar de la naturaleza. Cuenta con infraestructura básica y es un punto de referencia para los amantes de los deportes extremos y la fotografía de paisajes.',
                'image' => 'https://picsum.photos/id/1036/400/300',
                'latitude' => 4.8345,
                'longitude' => -75.7234,
            ],
            [
                'name' => 'La Divisa De Don Juan',
                'location' => 'Vía Altagracia, Altagracia, Pereira, Risaralda',
                'description' => 'Mirador y punto de referencia histórico en la vía hacia Altagracia. El lugar ofrece vistas del valle y es un punto de parada común para los viajeros. Cuenta con restaurantes típicos donde los visitantes pueden disfrutar de la gastronomía local mientras admiran el paisaje.',
                'image' => 'https://picsum.photos/id/1037/400/300',
                'latitude' => 4.8123,
                'longitude' => -75.7456,
            ],
            [
                'name' => 'Cerro Batero',
                'location' => 'Quinchía, Risaralda',
                'description' => 'Cerro emblemático del municipio de Quinchía que ofrece vistas panorámicas de la región. Es un destino para senderismo y observación de la naturaleza. El cerro tiene importancia cultural y natural, siendo un punto de referencia geográfico y un lugar de interés turístico para quienes visitan el municipio.',
                'image' => 'https://picsum.photos/id/1038/400/300',
                'latitude' => 5.3456,
                'longitude' => -75.7890,
            ],
            [
                'name' => 'Reserva Forestal La Nona',
                'location' => 'Marsella, Risaralda',
                'description' => 'Reserva forestal que protege importantes ecosistemas y fuentes hídricas. El lugar es ideal para ecoturismo, investigación y educación ambiental. Los visitantes pueden disfrutar de senderos ecológicos, observación de flora y fauna, y aprender sobre la importancia de la conservación forestal en la región.',
                'image' => 'https://picsum.photos/id/1039/400/300',
                'latitude' => 4.9234,
                'longitude' => -75.7567,
            ],
            [
                'name' => 'Reserva Natural Cerro Gobia',
                'location' => 'Quinchía, Risaralda',
                'description' => 'Reserva natural que protege importantes ecosistemas de bosque andino. El cerro es hábitat de diversas especies de flora y fauna, algunas endémicas. Es un destino para ecoturismo y observación de aves, con senderos que permiten a los visitantes explorar la biodiversidad mientras disfrutan de paisajes montañosos.',
                'image' => 'https://picsum.photos/id/1040/400/300',
                'latitude' => 5.3567,
                'longitude' => -75.8012,
            ],
            [
                'name' => 'Kaukitá Bosque Reserva',
                'location' => 'Pereira, Risaralda',
                'description' => 'Reserva privada dedicada a la conservación y el ecoturismo. El lugar ofrece senderos ecológicos, áreas de camping y actividades de educación ambiental. Es ideal para grupos que buscan una experiencia de naturaleza y aprendizaje sobre conservación, con guías especializados que comparten conocimientos sobre la biodiversidad local.',
                'image' => 'https://picsum.photos/id/1041/400/300',
                'latitude' => 4.8456,
                'longitude' => -75.7345,
            ],
            [
                'name' => 'Reserva Natural DMI Agualinda',
                'location' => 'Apía, Risaralda',
                'description' => 'Distrito de Manejo Integrado que protege importantes ecosistemas y fuentes hídricas. La reserva es crucial para la conservación del agua en la región y alberga una gran diversidad biológica. Es un destino para ecoturismo responsable, investigación científica y educación ambiental, con senderos que permiten conocer la importancia de estos ecosistemas.',
                'image' => 'https://picsum.photos/id/1042/400/300',
                'latitude' => 5.1234,
                'longitude' => -75.9123,
            ],
        ];

        // Crear lugares de Parques y Más
        foreach ($parques as $parque) {
            $place = Place::create($parque);
            $place->categories()->attach($categoriaParques->id);
        }

        // Crear lugares Acuáticos
        foreach ($acuaticos as $acuatico) {
            $place = Place::create($acuatico);
            $place->categories()->attach($categoriaAcuaticos->id);
        }

        // Crear lugares Montañosos
        foreach ($montanosos as $montanoso) {
            $place = Place::create($montanoso);
            $place->categories()->attach($categoriaMontanosos->id);
        }

        $this->command->info('¡Lugares creados exitosamente!');
        $this->command->info('Total de lugares: ' . (count($parques) + count($acuaticos) + count($montanosos)));
    }
}
