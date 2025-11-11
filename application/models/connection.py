# Importação das bibliotecas necessárias.
import os
import psycopg2
from psycopg2.extras import RealDictCursor

# URL da base de dados local do PostgreSQL.
local_database_url = "postgresql://postgres:root@localhost/ride_db"

# Função de conexão com a base de dados.
def connect_to_database():
    
    # Procura pela variável de ambiente criada no hospedeiro para conexão com o banco de dados.
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:

        # Se não achar a URL de hospedagem na nuvem usar a URL do localhost.
        print("Conexão com o PostegreSQL na nuvem não estabelecida. Usando o banco de dados local...")
        database_url = local_database_url

    try:

        # Tenta conectar ao banco de dados.
        connection = psycopg2.connect(database_url)
        return connection
    
    except Exception as e:

        # Se falhar, exibe o erro.
        print(f"Não foi possível conectar ao banco de dados...")
        print(f"Detalhe: {e}")
        return None