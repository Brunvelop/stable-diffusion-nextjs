import { createClient } from '@supabase/supabase-js';

// Utiliza las variables de entorno para crear el cliente supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req, res) {
  // Verifica si el método de la solicitud es POST
  if (req.method === 'POST') {
    // Extrae los datos necesarios del cuerpo de la solicitud
    const { recive_address, id_generative, tx_pay, image_base64 } = req.body;

    // Inserta los datos en la tabla 'purchases'
    const { data, error } = await supabase.from('purchases').insert([
      {
        recive_address,
        id_generative,
        tx_pay,
        tx_pay_confirmed: false,
        image_base64,
      },
    ]);

    // Si hay un error, envía una respuesta con el error
    if (error) {
      res.status(400).json({ error: error.message });
    } else {
      // Si todo está bien, envía una respuesta con los datos insertados
      res.status(200).json(data);
    }
  } else if (req.method === 'GET') {
    // Realiza una consulta para obtener todos los campos id_inscription no nulos de la tabla purchases
    const { data, error } = await supabase
      .from('purchases')
      .select('id_inscription, inscription_number')
      .not('id_inscription', 'eq', null)
      .not('inscription_number', 'is', null)
      .order('inscription_number', { ascending: false })
      .limit(100);

    // Si hay un error, envía una respuesta con el error
    if (error) {
      res.status(400).json({ error: error.message });
    } else {
      // Si todo está bien, envía una respuesta con los datos consultados
      res.status(200).json(data);
    }
  } else {
    // Si el método de la solicitud no es POST ni GET, envía un mensaje de error
    res.status(405).json({ error: 'Método no permitido' });
  }
}